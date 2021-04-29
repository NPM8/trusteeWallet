/**
 * @version 0.43
 */
import React, { Component } from 'react'
import { View, Text, ScrollView, Image, TextInput  } from 'react-native'

import Navigation from '@app/components/navigation/Navigation'
import Button from '@app/components/elements/Button'
import { strings } from '@app/services/i18n'

class FioChooseAddress extends Component {

    render() {
        return (
            <View>
                <Navigation
                    title= {strings('FioChooseAddress.title')}
                />
                
                <View style={{paddingTop: 90, height: '100%'}}>

                <View  style={styles.container}>
                    <View>
                        <Text style={styles.txt}>{strings('FioChooseAddress.description')}</Text>
                        <TextInput
                            style={styles.input}
                            onChangeText={text => console.log('Input changed')}
                        />
                    </View>

                    <View style={{ flex: 1,  paddingVertical: 20}}>
                        <ScrollView>

                            <View  style={styles.fio_item}>
                                <Image style={styles.fio_img} resize={'stretch'} source={require('../../assets/images/fio-logo.png')}/>
                                <Text style={styles.fio_txt}>Fio Adress 1</Text>
                            </View>

                            <View  style={styles.fio_item}>
                                <Image style={styles.fio_img} resize={'stretch'} source={require('../../assets/images/fio-logo.png')}/>
                                <Text style={styles.fio_txt}>Fio Adress 2</Text>
                            </View>

                        </ScrollView>
                    </View>

                    <View style={{marginTop: 20}}>
                        <Button press={() =>  console.log('select FIO pressed')}>
                            {strings('FioChooseAddress.btnText')}
                        </Button>
                    </View>
                </View>

                </View>
            </View>
        );
    }
}

export default FioChooseAddress


const styles = {

    container: {
        padding: 30,
        height: '100%',
        flexDirection: 'column',
        flex: 1,
        justifyContent: 'space-between'
    },

    input: {
        fontFamily: 'SFUIDisplay-Regular',
        fontSize: 19,
        color: '#404040',
        marginTop: 0,
        marginBottom: 20,
        height: 40,
        borderColor: '#864dd9',
        borderBottomWidth: 3
    },

    fio_item: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',

        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e3e6e9',
        backgroundColor: '#fff',
        borderRadius: 20
    },

    fio_txt: {
        fontFamily: 'SFUIDisplay-Regular',
        fontSize: 19,
        color: '#404040',
    },

    fio_img: {
        width: 25,
        height: 25,
        marginRight: 20,
        borderWidth: 1,
        borderColor: '#e3e6e9',
        padding: 20,
        borderRadius: 100
    },

    txt: {
        fontFamily: 'SFUIDisplay-Regular',
        fontSize: 19,
        color: '#777',
    },


}
