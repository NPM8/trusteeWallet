/**
 * @version 0.50
 */
import EthBasic from './basic/EthBasic'
import BlocksoftAxios from '@crypto/common/BlocksoftAxios'
import BlocksoftPrettyNumbers from '@crypto/common/BlocksoftPrettyNumbers'
import BlocksoftUtils from '@crypto/common/BlocksoftUtils'

const API_PATH = 'https://api.opensea.io/api/v1/'
export default class EthTokenProcessorNft extends EthBasic {


    /**
     * https://docs.opensea.io/reference/getting-assets
     * curl --request GET --url https://api.opensea.io/api/v1/assets?order_direction=desc&offset=0&limit=20&owner=0x6cdb97bf46d77233cc943264633c2ed56bcf6f1f
     * @param data.address
     * @param data.tokenBlockchainCode
     * @returns {Promise<void>}
     */
    async getListBlockchain(data) {
        // for tests only data.address = '0x6cdb97bf46d77233cc943264633c2ed56bcf6f1f'
        const link = API_PATH + 'assets?order_direction=desc&owner=' + data.address
        const result = await BlocksoftAxios.getWithoutBraking(link)
        if (!result || !result.data || typeof result.data.assets === 'undefined' || !result.data.assets || result.data.assets.length === 0) {
            return false
        }
        /**
         * @var tmp.id
         * @var tmp.token_id
         * @var tmp.image_thumbnail_url
         * @var tmp.name
         * @var tmp.title
         * @var tmp.last_sale
         * @var tmp.last_sale.total_price
         * @var tmp.last_sale.payment_token
         * @var tmp.last_sale.payment_token.symbol
         * @var tmp.last_sale.payment_token.name
         * @var tmp.last_sale.payment_token.decimals
         * @var tmp.last_sale.payment_token.usd_price
         * @var tmp.asset_contract.address
         * @var tmp.asset_contract.schema_name ERC721
         */
        const formatted = []
        const collections = []
        let usdTotal = 0
        for (const tmp of result.data.assets) {
            const one = {
                id: tmp.id,
                tokenId: tmp.token_id,
                contractAddress: '',
                tokenBlockchainCode: data.tokenBlockchainCode,
                img: tmp.image_thumbnail_url,
                title: tmp.name || tmp.title,
                subTitle: '',
                desc : '',
                cryptoCurrencySymbol: '',
                cryptoValuePretty: '',
                usdValuePretty: '',
                permalink: tmp.permalink || false
            }
            try {
                if (!one.title || typeof one.title === 'undefined') {
                    if (typeof tmp.asset_contract.name !== 'undefined') {
                        one.title = tmp.asset_contract.name
                    }
                }
                if (typeof tmp.asset_contract.description !== 'undefined' && tmp.asset_contract.description) {
                    one.desc = tmp.asset_contract.description
                }
                if (one.title.indexOf(tmp.token_id) === -1) {
                    one.subTitle = '#' + tmp.token_id
                } else if (one.desc) {
                    one.subTitle = one.desc.length > 20 ? (one.desc.substring(0, 20) + '...') : one.desc
                }
            } catch (e) {
                console.log('EthTokenProcessorNft.getListBlockchain name error ' + e.message)
            }


            try {
                if (typeof tmp.asset_contract.address !== 'undefined' && tmp.asset_contract.address) {
                    one.contractAddress = tmp.asset_contract.address
                }
                if (typeof tmp.asset_contract.schema_name !== 'undefined' && tmp.asset_contract.schema_name) {
                    one.contractSchema = tmp.asset_contract.schema_name
                }
            } catch (e) {
                console.log('EthTokenProcessorNft.getListBlockchain contract error ' + e.message)
            }

            try {
                if (typeof tmp.last_sale !== 'undefined' && tmp.last_sale) {
                    one.cryptoCurrencySymbol = tmp.last_sale.payment_token.symbol
                    one.cryptoValuePretty = BlocksoftPrettyNumbers.makeCut(BlocksoftUtils.toUnified(tmp.last_sale.total_price, tmp.last_sale.payment_token.decimals)).separated
                    one.usdValuePretty = BlocksoftPrettyNumbers.makeCut(tmp.last_sale.payment_token.usd_price).separated
                    usdTotal = usdTotal + tmp.last_sale.payment_token.usd_price * 1
                }
            } catch (e) {
                console.log('EthTokenProcessorNft.getListBlockchain last_sale error ' + e.message, JSON.stringify(tmp))
            }

            let collectionKey = ''
            try {
                if (typeof tmp.collection !== 'undefined') {
                    collectionKey = tmp.collection.name + '_' + tmp.collection.payout_address
                    if (typeof collections[collectionKey] === 'undefined') {
                        collections[collectionKey] = {
                            numberAssets: 1,
                            title: tmp.collection.name,
                            img: tmp.collection.banner_image_url || tmp.collection.image_url,
                            walletCurrency: data.tokenBlockchainCode,
                            assets : [one]
                        }
                    } else {
                        collections[collectionKey].numberAssets++
                        collections[collectionKey].assets.push(one)
                    }
                }
            } catch (e) {
                console.log('EthTokenProcessorNft.getListBlockchain collection error ' + e.message)
            }


            formatted.push(one)
        }

        const formattedCollections = []
        if (collections) {
            for (const key in collections) {
                formattedCollections.push(collections[key])
            }
        }
        return { assets: formatted, collections : formattedCollections, usdTotal, usdTotalPretty: BlocksoftPrettyNumbers.makeCut(usdTotal).separated }
    }
}
