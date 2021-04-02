/**
 * @version 0.41
 */
import { BlocksoftBlockchainTypes } from '@crypto/blockchains/BlocksoftBlockchainTypes'
import DogeSendProvider from '@crypto/blockchains/doge/providers/DogeSendProvider'
import BlocksoftCryptoLog from '@crypto/common/BlocksoftCryptoLog'

import BlocksoftAxios from '@crypto/common/BlocksoftAxios'
import config from '@app/config/config'

export default class TrxSendProvider extends DogeSendProvider implements BlocksoftBlockchainTypes.SendProvider {


    trxError(msg: string) {
        if (this._settings.currencyCode !== 'TRX' && msg.indexOf('AccountResourceInsufficient') !== -1) {
            throw new Error('SERVER_RESPONSE_NOT_ENOUGH_FEE')
        } else if (msg.indexOf('balance is not sufficient') !== -1) {
            throw new Error('SERVER_RESPONSE_NOT_ENOUGH_FEE')
        } else if (msg.indexOf('account not exist') !== -1) {
            throw new Error('SERVER_RESPONSE_NOT_ENOUGH_FEE')
        } else if (msg.indexOf('Amount must greater than 0') !== -1) {
            throw new Error('SERVER_RESPONSE_NOT_ENOUGH_AMOUNT_AS_DUST')
        } else if (msg.indexOf('assetBalance must be greater than 0') !== -1 || msg.indexOf('assetBalance is not sufficient') !== -1) {
            throw new Error('SERVER_RESPONSE_NOTHING_TO_TRANSFER')
        } else {
            throw new Error(msg)
        }
    }

    async _sendTx(tx: any, subtitle: string, txRBF: any, logData: any): Promise<{ transactionHash: string, logData : any }> {
        await BlocksoftCryptoLog.log(this._settings.currencyCode + ' TrxSendProvider._sendTx ' + subtitle + ' started ', logData)

        const link = this._trezorServerCode + '/wallet/broadcasttransaction'

        if (config.debug.cryptoErrors) {
            console.log(new Date().toISOString() + ' ' + this._settings.currencyCode + ' TrxSendProvider._sendTx ' + subtitle + ' started check ')
        }
        logData = await this._check(tx.raw_data_hex, subtitle, txRBF, logData)
        if (config.debug.cryptoErrors) {
            console.log(new Date().toISOString() + ' ' + this._settings.currencyCode + ' TrxSendProvider._sendTx ' + subtitle + ' ended check ')
        }

        let send = false
        try {
            send = await BlocksoftAxios.post(link, tx)
        } catch (e) {
           if (config.debug.cryptoErrors) {
               console.log(this._settings.currencyCode + ' TrxSendProvider._sendTx broadcast error ' + e.message)
           }
        }

        // @ts-ignore
        if (!send || typeof send.data === 'undefined' || !send.data) {
            throw new Error('SERVER_RESPONSE_NOT_CONNECTED')
        }
        if (typeof send.data.code !== 'undefined') {
            if (send.data.code === 'BANDWITH_ERROR') {
                throw new Error('SERVER_RESPONSE_BANDWITH_ERROR_TRX')
            } else if (send.data.code === 'SERVER_BUSY') {
                throw new Error('SERVER_RESPONSE_NOT_CONNECTED')
            }
        }

        // @ts-ignore
        if (typeof send.data.Error !== 'undefined') {
            await BlocksoftCryptoLog.log(this._settings.currencyCode + ' TrxSendProvider._sendTx error ' + send.data.Error)
            // @ts-ignore
            throw new Error(send.data.Error)
        }
        // @ts-ignore
        if (typeof send.data.result === 'undefined') {
            // @ts-ignore
            if (typeof send.data.message !== 'undefined') {
                let msg = false
                try {
                    // @ts-ignore
                    const buf = Buffer.from(send.data.message, 'hex')
                    // @ts-ignore
                    msg = buf.toString('')
                } catch (e) {
                    // do nothing
                }
                if (msg) {
                    // @ts-ignore
                    send.data.decoded = msg
                    // @ts-ignore
                    this.checkError(msg)
                }
            }
            // @ts-ignore
            this.checkError('no transaction result ' + JSON.stringify(send.data))
        }
        // @ts-ignore
        if (send.data.result !== true) {
            // @ts-ignore
            this.checkError('transaction result is false ' + JSON.stringify(send.data))
        }

        return {transactionHash : tx.txID, logData}
    }

    async sendTx(tx: any, subtitle: string, txRBF: any, logData: any): Promise<{ transactionHash: string, transactionJson: any, logData }> {
        await BlocksoftCryptoLog.log(this._settings.currencyCode + ' TrxSendProvider.sendTx ' + subtitle + ' started ', logData)

        let send, transactionHash
        try {
            send = await this._sendTx(tx, subtitle, txRBF, logData)
            transactionHash = send.transactionHash
        } catch (e) {
            if (config.debug.cryptoErrors) {
                console.log(this._settings.currencyCode + ' TrxSendProvider.sendTx error ', e)
            }
            try {
                logData.error = e.message
                await this._checkError(tx.raw_data_hex, subtitle, txRBF, logData)
            } catch (e2) {
                if (config.debug.cryptoErrors) {
                    console.log(this._settings.currencyCode + ' TrxSendProvider.send proxy error errorTx ' + e.message)
                }
                await BlocksoftCryptoLog.log(this._settings.currencyCode + ' TrxSendProvider.send proxy error errorTx ' + e2.message)
            }
            throw e
        }


        logData = await this._checkSuccess(transactionHash, tx.raw_data_hex, subtitle, txRBF, logData)
        return { transactionHash, transactionJson: {}, logData }
    }
}