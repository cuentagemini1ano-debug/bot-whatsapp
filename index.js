const qrcode = require('qrcode-terminal')

const {
    Client,
    LocalAuth
} = require('whatsapp-web.js')

const TelegramBot =
require('node-telegram-bot-api')

// ======================================
// TOKEN TELEGRAM
// ======================================

const TOKEN =
'8812023653:AAHNWwQzSk4DjjTysaPe2oWVlmhuPzKgqoU'

// ======================================
// TU CHAT ID
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
if (publicaciones[id]) return

publicaciones[id] = true
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

client.on('ready', async () => {

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
Ver configuración`
    )
})

// ======================================
// ID TELEGRAM
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

bot.onText(/\/origen (.+)/, (msg, match) => {

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

bot.onText(/\/destino (.+)/, (msg, match) => {

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

bot.onText(/\/quitarorigen (.+)/, (msg, match) => {

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

bot.onText(/\/quitardestino/, (msg) => {

    DESTINO = ''

    bot.sendMessage(

        msg.chat.id,

'❌ DESTINO ELIMINADO'
    )
})

// ======================================
// CONFIG
// ======================================

bot.onText(/\/config/, (msg) => {

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
// TEST DESTINO
// ======================================

bot.onText(/\/test/, async (msg) => {

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

client.on('message_create', async (msg) => {

    try {

        console.log('\n📩 NUEVO MENSAJE')
        console.log(msg.from)

        // SOLO ORIGENES
        if (
            !ORIGENES.includes(msg.from)
        ) return

        // IGNORAR MEDIA
        if (
            msg.hasMedia
        ) return

        // IGNORAR VACIOS
        if (
            !msg.body
        ) return

        // TEXTO
        const texto =
        msg.body.trim()

        // ID
        const id =
        Date.now()

        // GUARDAR
        mensajesPendientes[id] = texto

        // BOTONES
        const opciones = {

            reply_markup: {

                inline_keyboard: [

                    [

                        {
                            text:
                            '✅ PUBLICAR',

                            callback_data:
                            `publicar_${id}`
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

        // ENVIAR A TELEGRAM
        await bot.sendMessage(

            ADMINS,

`📰 NUEVA NOTICIA

${texto}

━━━━━━━━━━━━━━━

¿PUBLICAR?`,

            opciones
        )

        console.log(
'📨 ENVIADO A TELEGRAM'
        )

    } catch (err) {

        console.log(err)
    }
})

// ======================================
// BOTONES TELEGRAM
// ======================================

bot.on('callback_query',

async (query) => {

    try {

        const data =
        query.data

        // ======================================
        // PUBLICAR
        // ======================================

        if (
            data.startsWith(
                'publicar_'
            )
        ) {

            const id =
            data.replace(
                'publicar_',
                ''
            )

            const texto =
            mensajesPendientes[id]

            // VALIDAR
            if (!texto) {

                return bot.answerCallbackQuery(

                    query.id,

                    {
                        text:
                        '❌ TEXTO NO ENCONTRADO'
                    }
                )
            }

            if (!DESTINO) {

                return bot.answerCallbackQuery(

                    query.id,

                    {
                        text:
                        '❌ DESTINO VACÍO'
                    }
                )
            }

            // ENVIAR
            await client.sendMessage(

                DESTINO,

`${HEADER}${texto}

📍 Más información próximamente`
            )

            console.log(
'✅ PUBLICADO'
            )

            // EDITAR MENSAJE
            await bot.editMessageText(

`✅ PUBLICADO

${texto}`,

            {

                chat_id:
                query.message.chat.id,

                message_id:
                query.message.message_id
            })

            // ALERTA
            await bot.answerCallbackQuery(

                query.id,

                {
                    text:
                    '✅ PUBLICADO'
                }
            )

            // BORRAR MEMORIA
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

            await bot.editMessageText(

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

        console.log('\n❌ ERROR BOTON:\n')
        console.log(err)
    }
})

// ======================================
// INICIAR
// ======================================

console.log('\n🚀 PANEL ACTIVO\n')

client.initialize()