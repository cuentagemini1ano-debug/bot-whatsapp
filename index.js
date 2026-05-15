const qrcode = require('qrcode-terminal')

const fs = require('fs')

const Jimp = require('jimp')

const {
    Client,
    LocalAuth,
    MessageMedia
} = require('whatsapp-web.js')

const TelegramBot =
require('node-telegram-bot-api')

// ======================================
// TOKEN TELEGRAM
// ======================================

const TOKEN =
'8812023653:AAHNWwQzSk4DjjTysaPe2oWVlmhuPzKgqoU'

// ======================================
// ADMINS TELEGRAM
// ======================================

const ADMINS = [

    5766404349,
    8558292983
]

// ======================================
// VARIABLES
// ======================================

let ORIGENES = []

let DESTINO = ''

const mensajesPendientes = {}

const publicaciones = {}

// ======================================
// HEADER
// ======================================

const HEADER =
`📰 *LA EXTENSIÓN 666 NEWS*

`

// ======================================
// TELEGRAM
// ======================================

const bot =
new TelegramBot(TOKEN, {

    polling: true
})

// ======================================
// WHATSAPP
// ======================================

const client = new Client({

    authStrategy:
    new LocalAuth(),

    puppeteer: {

        headless: true,

        args: [

            '--no-sandbox',
            '--disable-setuid-sandbox'
        ]
    }
})

// ======================================
// QR
// ======================================

client.on('qr', (qr) => {

    console.log('\n📱 ESCANEA EL QR:\n')

    qrcode.generate(qr, {
        small: true
    })
})

// ======================================
// READY
// ======================================

client.on('ready', () => {

    console.log('\n🟢 WHATSAPP CONECTADO')
    console.log('🚀 BOT ACTIVO\n')
})

// ======================================
// DESCONECTADO
// ======================================

client.on('disconnected', () => {

    console.log('\n🔴 WHATSAPP DESCONECTADO\n')
})

// ======================================
// START
// ======================================

bot.onText(/\/start/, (msg) => {

    bot.sendMessage(

        msg.chat.id,

`🤖 PANEL BOT WHATSAPP

COMANDOS:

/estado
Estado WhatsApp

/id
Tu ID Telegram

/origen ID
Agregar origen

/destino ID
Configurar destino

/quitarorigen ID
Eliminar origen

/quitardestino
Eliminar destino

/config
Ver configuración

/test
Probar destino`
    )
})

// ======================================
// ID
// ======================================

bot.onText(/\/id/, (msg) => {

    bot.sendMessage(

        msg.chat.id,

`🆔 TU ID:

${msg.chat.id}`
    )
})

// ======================================
// ESTADO
// ======================================

bot.onText(/\/estado/, async (msg) => {

    try {

        const estado =
        await client.getState()

        bot.sendMessage(

            msg.chat.id,

`🟢 ESTADO:

${estado}`
        )

    } catch {

        bot.sendMessage(

            msg.chat.id,

            '🔴 WHATSAPP DESCONECTADO'
        )
    }
})

// ======================================
// AGREGAR ORIGEN
// ======================================

bot.onText(/\/origen (.+)/,

(msg, match) => {

    const id = match[1]

    ORIGENES.push(id)

    bot.sendMessage(

        msg.chat.id,

`✅ ORIGEN AGREGADO

${id}`
    )
})

// ======================================
// DESTINO
// ======================================

bot.onText(/\/destino (.+)/,

(msg, match) => {

    DESTINO = match[1]

    bot.sendMessage(

        msg.chat.id,

`✅ DESTINO CONFIGURADO

${DESTINO}`
    )
})

// ======================================
// QUITAR ORIGEN
// ======================================

bot.onText(/\/quitarorigen (.+)/,

(msg, match) => {

    const id = match[1]

    ORIGENES =
    ORIGENES.filter(
        x => x !== id
    )

    bot.sendMessage(

        msg.chat.id,

`❌ ORIGEN ELIMINADO

${id}`
    )
})

// ======================================
// QUITAR DESTINO
// ======================================

bot.onText(/\/quitardestino/,

(msg) => {

    DESTINO = ''

    bot.sendMessage(

        msg.chat.id,

'❌ DESTINO ELIMINADO'
    )
})

// ======================================
// CONFIG
// ======================================

bot.onText(/\/config/,

(msg) => {

    bot.sendMessage(

        msg.chat.id,

`⚙️ CONFIGURACIÓN

📥 ORÍGENES:

${ORIGENES.join('\n') || 'NINGUNO'}

━━━━━━━━━━━━━━━

📤 DESTINO:

${DESTINO || 'NO CONFIGURADO'}`
    )
})

// ======================================
// TEST
// ======================================

bot.onText(/\/test/,

async (msg) => {

    try {

        await client.sendMessage(

            DESTINO,

`🧪 TEST DESTINO

SI VES ESTO FUNCIONA`
        )

        bot.sendMessage(

            msg.chat.id,

            '✅ MENSAJE ENVIADO'
        )

    } catch (err) {

        console.log(err)

        bot.sendMessage(

            msg.chat.id,

            '❌ ERROR EN DESTINO'
        )
    }
})

// ======================================
// MENSAJES
// ======================================

client.on('message_create',

async (msg) => {

    try {

        console.log('\n📩 NUEVO MENSAJE')
        console.log(msg.from)

        // SOLO ORIGENES
        if (
            !ORIGENES.includes(msg.from)
        ) return

        // IGNORAR VACIOS
        if (
            !msg.body &&
            !msg.hasMedia
        ) return

        // TEXTO
        const texto =
        msg.body || ''

        // ID
        const id =
        Date.now()

        // ======================================
        // FOTO
        // ======================================

        if (msg.hasMedia) {

            const media =
            await msg.downloadMedia()

            mensajesPendientes[id] = {

                texto,
                media
            }

            const opciones = {

                reply_markup: {

                    inline_keyboard: [

                        [

                            {
                                text:
                                '📝 SOLO TEXTO',

                                callback_data:
                                `texto_${id}`
                            }
                        ],

                        [

                            {
                                text:
                                '🖼 FOTO + TEXTO',

                                callback_data:
                                `foto_${id}`
                            }
                        ],

                        [

                            {
                                text:
                                '❌ CANCELAR',

                                callback_data:
                                `cancelar_${id}`
                            }
                        ]
                    ]
                }
            }

            for (const admin of ADMINS) {

                await bot.sendPhoto(

                    admin,

                    media.data,

                    {

                        caption:
`📰 NUEVA NOTICIA

${texto}

━━━━━━━━━━━━━━━

¿QUÉ HACER?`,

                        reply_markup:
                        opciones.reply_markup
                    }
                )
            }

            console.log(
'📸 FOTO ENVIADA A TELEGRAM'
            )

            return
        }

        // ======================================
        // SOLO TEXTO
        // ======================================

        mensajesPendientes[id] = {

            texto
        }

        const opciones = {

            reply_markup: {

                inline_keyboard: [

                    [

                        {
                            text:
                            '✅ PUBLICAR',

                            callback_data:
                            `texto_${id}`
                        },

                        {
                            text:
                            '❌ CANCELAR',

                            callback_data:
                            `cancelar_${id}`
                        }
                    ]
                ]
            }
        }

        for (const admin of ADMINS) {

            await bot.sendMessage(

                admin,

`📰 NUEVA NOTICIA

${texto}

━━━━━━━━━━━━━━━

¿PUBLICAR?`,

                opciones
            )
        }

        console.log(
'📨 TEXTO ENVIADO'
        )

    } catch (err) {

        console.log(err)
    }
})

// ======================================
// BOTONES
// ======================================

bot.on('callback_query',

async (query) => {

    try {

        const data =
        query.data

        // ======================================
        // SOLO TEXTO
        // ======================================

        if (
            data.startsWith(
                'texto_'
            )
        ) {

            const id =
            data.replace(
                'texto_',
                ''
            )

            if (publicaciones[id]) {

                return bot.answerCallbackQuery(

                    query.id,

                    {
                        text:
                        '⚠️ YA PUBLICADO'
                    }
                )
            }

            publicaciones[id] = true

            const datos =
            mensajesPendientes[id]

            if (!datos) {

                return
            }

            await client.sendMessage(

                DESTINO,

`${HEADER}${datos.texto}

📍 Más información próximamente`
            )

            await bot.editMessageCaption(

`✅ PUBLICADO

${datos.texto}`,

            {

                chat_id:
                query.message.chat.id,

                message_id:
                query.message.message_id
            })

            await bot.answerCallbackQuery(

                query.id,

                {
                    text:
                    '✅ PUBLICADO'
                }
            )

            delete mensajesPendientes[id]
        }

        // ======================================
        // FOTO + TEXTO
        // ======================================

        if (
            data.startsWith(
                'foto_'
            )
        ) {

            const id =
            data.replace(
                'foto_',
                ''
            )

            if (publicaciones[id]) {

                return bot.answerCallbackQuery(

                    query.id,

                    {
                        text:
                        '⚠️ YA PUBLICADO'
                    }
                )
            }

            publicaciones[id] = true

            const datos =
            mensajesPendientes[id]

            if (!datos) {

                return
            }

            const media =
            datos.media

            const texto =
            datos.texto

            // CREAR TEMP
            if (!fs.existsSync('./temp')) {

                fs.mkdirSync('./temp')
            }

            // RUTAS
            const imagenPath =
            `./temp/${id}.png`

            const salidaPath =
            `./temp/${id}_final.png`

            // GUARDAR
            fs.writeFileSync(

                imagenPath,

                Buffer.from(
                    media.data,
                    'base64'
                )
            )

            // ABRIR FOTO
            const imagen =
            await Jimp.read(
                imagenPath
            )

            // ABRIR LOGO
            const logo =
            await Jimp.read(
                './watermark.png'
            )

            // TAMAÑO
            logo.resize({

                width:
                imagen.bitmap.width * 0.55
            })

            // OPACIDAD
            logo.opacity(0.30)

            // POSICIÓN
            const x =

                (imagen.bitmap.width -
                logo.bitmap.width) / 2

            const y =

                (imagen.bitmap.height -
                logo.bitmap.height) / 2

            // PEGAR
            imagen.composite(
                logo,
                x,
                y
            )

            // GUARDAR FINAL
            await imagen.write(
                salidaPath
            )

            // ENVIAR
            await client.sendMessage(

                DESTINO,

                MessageMedia.fromFilePath(
                    salidaPath
                ),

                {

                    caption:
`${HEADER}${texto}

📍 Más información próximamente`
                }
            )

            await bot.editMessageCaption(

`✅ FOTO PUBLICADA

${texto}`,

            {

                chat_id:
                query.message.chat.id,

                message_id:
                query.message.message_id
            })

            await bot.answerCallbackQuery(

                query.id,

                {
                    text:
                    '✅ FOTO PUBLICADA'
                }
            )

            delete mensajesPendientes[id]
        }

        // ======================================
        // CANCELAR
        // ======================================

        if (
            data.startsWith(
                'cancelar_'
            )
        ) {

            const id =
            data.replace(
                'cancelar_',
                ''
            )

            delete mensajesPendientes[id]

            await bot.editMessageCaption(

'❌ CANCELADO',

            {

                chat_id:
                query.message.chat.id,

                message_id:
                query.message.message_id
            })

            await bot.answerCallbackQuery(

                query.id,

                {
                    text:
                    '❌ CANCELADO'
                }
            )
        }

    } catch (err) {

        console.log('\n❌ ERROR:\n')
        console.log(err)
    }
})

// ======================================
// INICIAR
// ======================================

console.log('\n🚀 PANEL ACTIVO\n')

client.initialize()