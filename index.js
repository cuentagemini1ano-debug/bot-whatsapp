const qrcode = require('qrcode-terminal')

const fs = require('fs')

const Jimp = require('jimp')

const qr = require('qr-image')

const express = require('express')

const app = express()

const PORT = process.env.PORT || 3000

// ======================================
// SERVER WEB
// ======================================

app.use(express.static('.'))

app.get('/', (req, res) => {

    res.send('BOT ACTIVO')
})

app.listen(PORT, () => {

    console.log(`🌐 SERVER ACTIVO EN ${PORT}`)
})

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
    process.env.TOKEN || '8812023653:AAEVwzRFG3FJEPlsks6iVS4etv2ldbjsmNQ'

// ======================================
// ADMINS
// ======================================

const ADMINS = [

    5766404349,
    8558292983,
    1845363088
]

// ======================================
// VARIABLES Y MEMORIA
// ======================================

const CONFIG_FILE = './config.json'
let ORIGENES = []
let DESTINOS = []

// Cargar datos guardados si el archivo existe
if (fs.existsSync(CONFIG_FILE)) {
    const data = fs.readFileSync(CONFIG_FILE)
    const configJSON = JSON.parse(data)
    ORIGENES = configJSON.origenes || []
    DESTINOS = configJSON.destinos || []
}

// Función para guardar automáticamente cada vez que agregas algo
const guardarConfig = () => {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify({
        origenes: ORIGENES,
        destinos: DESTINOS
    }, null, 2))
}

const mensajesPendientes = {}
const publicaciones = {}


// ======================================
// DELAY
// ======================================

const delay = ms =>
    new Promise(resolve =>
        setTimeout(resolve, ms)
    )

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

        polling: {

            autoStart: true,

            interval: 3000,

            params: {

                timeout: 10
            }
        }
    })

// ======================================
// WHATSAPP
// ======================================

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu'
        ]
    }
});



// ======================================
// QR
// ======================================

client.on('qr', (qrCode) => {

    console.log('\n📱 GENERANDO QR...\n')

    const qr_png = qr.image(qrCode, {

        type: 'png'
    })

    qr_png.pipe(
        fs.createWriteStream('qr.png')
    )

    console.log('✅ QR GUARDADO COMO qr.png')
})

// ======================================
// READY
// ======================================

client.on('ready', async () => {
    console.log('\n🟢 WHATSAPP CONECTADO')
    console.log('🚀 BOT ACTIVO\n')

    // Obtener todos los chats
    const chats = await client.getChats();
    // Filtrar solo los grupos
    const groups = chats.filter(chat => chat.isGroup);

    // Imprimir en consola
    console.log('\n=== LISTA DE GRUPOS ===');
    groups.forEach(group => {
        console.log(`Nombre: ${group.name}`);
        console.log(`ID: ${group.id._serialized}\n`);
    });
    console.log('=======================\n');
})


// ======================================
// START
// ======================================

// ======================================
// CANALES (Comando Telegram)
// ======================================

// ======================================
// CANALES (Comando Telegram)
// ======================================

bot.onText(/\/canales/, async (msg) => {

    if (!ADMINS.includes(msg.chat.id)) return

    bot.sendMessage(msg.chat.id, '⏳ Buscando canales en tu cuenta...')

    try {
        await delay(3000)

        // 🟢 Usamos la función exclusiva para Canales en lugar de getChats()
        const canales = await client.getChannels()

        if (!canales || canales.length === 0) {
            return bot.sendMessage(
                msg.chat.id,
                '❌ No se detectaron canales. Si acabas de crear uno, envía un mensaje al canal desde tu teléfono para que WhatsApp lo registre y vuelve a intentar.'
            )
        }

        let mensaje = '📢 *LISTA DE CANALES*\n\n'

        canales.forEach(canal => {
            mensaje += `📢 *${canal.name}*\nID: \`${canal.id._serialized}\`\n\n`
        })

        bot.sendMessage(msg.chat.id, mensaje, { parse_mode: 'Markdown' })

    } catch (error) {
        console.log(error)
        bot.sendMessage(msg.chat.id, '❌ Hubo un error al leer los canales.')
    }
})



// ======================================
// GRUPOS (Comando Telegram)
// ======================================

bot.onText(/\/grupos/, async (msg) => {

    if (!ADMINS.includes(msg.chat.id)) return

    bot.sendMessage(msg.chat.id, '⏳ Obteniendo lista de grupos, un momento...')

    try {
        // Pausa de 5 segundos para asegurar que WhatsApp cargó todo
        await delay(5000)

        const chats = await client.getChats()
        const groups = chats.filter(chat => chat.isGroup)

        if (groups.length === 0) {
            return bot.sendMessage(msg.chat.id, '❌ No se encontraron grupos.')
        }

        let mensaje = '📋 *LISTA DE GRUPOS*\n\n'

        groups.forEach(group => {
            mensaje += `👥 *${group.name}*\nID: \`${group.id._serialized}\`\n\n`
        })

        bot.sendMessage(msg.chat.id, mensaje, { parse_mode: 'Markdown' })

    } catch (error) {
        console.log(error)
        bot.sendMessage(msg.chat.id, '❌ Hubo un error al leer los grupos.')
    }
})


// ======================================
// START
// ======================================

bot.onText(/\/start/, (msg) => {

    if (!ADMINS.includes(msg.chat.id))
        return

    bot.sendMessage(

        msg.chat.id,

        `🤖 PANEL BOT WHATSAPP

COMANDOS:

/id
/estado
/grupos
/canales
/origen ID
/destino ID
/quitarorigen ID
/quitardestino ID
/config
/test`
    )
})

// ======================================
// GRUPOS
// ======================================

bot.onText(/\/grupos/, async (msg) => {

    if (!ADMINS.includes(msg.chat.id))
        return

    bot.sendMessage(
        msg.chat.id,
        '⏳ Obteniendo lista de grupos, un momento...'
    )

    try {
        const chats = await client.getChats()
        const groups = chats.filter(chat => chat.isGroup)

        if (groups.length === 0) {
            return bot.sendMessage(
                msg.chat.id,
                '❌ No se encontraron grupos.'
            )
        }

        let mensaje = '📋 *LISTA DE GRUPOS*\n\n'

        groups.forEach(group => {
            // El ID va entre acentos graves (`) para que Telegram permita copiarlo al tocarlo
            mensaje += `👥 *${group.name}*\nID: \`${group.id._serialized}\`\n\n`
        })

        bot.sendMessage(
            msg.chat.id,
            mensaje,
            { parse_mode: 'Markdown' }
        )

    } catch (error) {
        console.log(error)
        bot.sendMessage(
            msg.chat.id,
            '❌ Hubo un error al leer los grupos.'
        )
    }
})


// ======================================
// ID
// ======================================

bot.onText(/\/id/, (msg) => {

    if (!ADMINS.includes(msg.chat.id))
        return

    bot.sendMessage(

        msg.chat.id,

        `🆔 ID:

${msg.chat.id}`
    )
})

// ======================================
// ESTADO
// ======================================

bot.onText(/\/estado/, async (msg) => {

    if (!ADMINS.includes(msg.chat.id))
        return

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

            '🔴 DESCONECTADO'
        )
    }
})

// ======================================
// ORIGEN
// ======================================

bot.onText(/\/origen (.+)/, (msg, match) => {
    if (!ADMINS.includes(msg.chat.id)) return
    const id = match[1]

    if (ORIGENES.includes(id)) {
        return bot.sendMessage(msg.chat.id, '⚠️ YA EXISTE')
    }

    ORIGENES.push(id)
    guardarConfig() // <-- Guarda el cambio en el archivo

    bot.sendMessage(msg.chat.id, `✅ ORIGEN AGREGADO\n\n${id}`)
})

// ======================================
// DESTINO
// ======================================

bot.onText(/\/destino (.+)/, (msg, match) => {
    if (!ADMINS.includes(msg.chat.id)) return
    const id = match[1]

    if (DESTINOS.includes(id)) {
        return bot.sendMessage(msg.chat.id, '⚠️ YA EXISTE')
    }

    DESTINOS.push(id)
    guardarConfig() // <-- Guarda el cambio en el archivo

    bot.sendMessage(msg.chat.id, `✅ DESTINO AGREGADO\n\n${id}`)
})

// ======================================
// QUITAR ORIGEN
// ======================================

bot.onText(/\/quitarorigen (.+)/, (msg, match) => {
    if (!ADMINS.includes(msg.chat.id)) return
    const id = match[1]

    ORIGENES = ORIGENES.filter(x => x !== id)
    guardarConfig() // <-- Guarda el cambio en el archivo

    bot.sendMessage(msg.chat.id, `❌ ORIGEN ELIMINADO\n\n${id}`)
})

// ======================================
// QUITAR DESTINO
// ======================================

bot.onText(/\/quitardestino (.+)/, (msg, match) => {
    if (!ADMINS.includes(msg.chat.id)) return
    const id = match[1]

    DESTINOS = DESTINOS.filter(x => x !== id)
    guardarConfig() // <-- Guarda el cambio en el archivo

    bot.sendMessage(msg.chat.id, `❌ DESTINO ELIMINADO\n\n${id}`)
})


// ======================================
// CONFIG
// ======================================

bot.onText(/\/config/,

    (msg) => {

        if (!ADMINS.includes(msg.chat.id))
            return

        bot.sendMessage(

            msg.chat.id,

            `⚙️ CONFIG

📥 ORÍGENES:

${ORIGENES.join('\n') || 'NINGUNO'}

━━━━━━━━━━━━━━━

📤 DESTINOS:

${DESTINOS.join('\n') || 'NO CONFIGURADOS'}`
        )
    })

// ======================================
// TEST
// ======================================

bot.onText(/\/test/,

    async (msg) => {

        if (!ADMINS.includes(msg.chat.id))
            return

        try {

            for (const destino of DESTINOS) {

                await client.sendMessage(

                    destino,

                    `🧪 TEST

FUNCIONANDO`
                )
            }

            bot.sendMessage(

                msg.chat.id,

                '✅ ENVIADO A TODOS'
            )

        } catch {

            bot.sendMessage(

                msg.chat.id,

                '❌ ERROR'
            )
        }
    })

// ======================================
// MENSAJES
// ======================================

client.on('message',

    async (msg) => {

        try {

            console.log('\n📩 NUEVO MENSAJE')
            console.log(msg.from)

            if (
                !ORIGENES.includes(msg.from)
            ) return

            if (msg.type === 'sticker')
                return

            if (msg.type === 'video')
                return

            if (msg.type === 'audio')
                return

            if (
                !msg.body &&
                !msg.hasMedia
            ) return

            const texto =
                msg.body || ''

            const id =
                Date.now()

            // FOTO

            if (msg.hasMedia) {

                const media =
                    await msg.downloadMedia()

                if (!media) return

                mensajesPendientes[id] = {

                    texto,
                    media
                }

                for (const admin of ADMINS) {

                    await bot.sendPhoto(

                        admin,

                        Buffer.from(
                            media.data,
                            'base64'
                        ),

                        {

                            caption:
                                `📰 NUEVA NOTICIA

${texto}

━━━━━━━━━━━━━━━

¿QUÉ HACER?`,

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
                    )
                }

                console.log(
                    '📸 FOTO ENVIADA'
                )

                return
            }

            // SOLO TEXTO

            mensajesPendientes[id] = {

                texto
            }

            for (const admin of ADMINS) {

                await bot.sendMessage(

                    admin,

                    `📰 NUEVA NOTICIA

${texto}`,

                    {

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
                )
            }

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

            // SOLO TEXTO

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

                if (!datos) return

                await bot.answerCallbackQuery(

                    query.id,

                    {
                        text:
                            '⏳ PUBLICANDO...'
                    }
                )

                await delay(5000)

                for (const destino of DESTINOS) {

                    await client.sendMessage(

                        destino,

                        `${HEADER}${datos.texto}

⚠️ Más información en proceso.`
                    )
                }

                delete mensajesPendientes[id]

                console.log(
                    '✅ TEXTO PUBLICADO'
                )
            }

            // FOTO + TEXTO

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

                if (!datos) return

                await bot.answerCallbackQuery(

                    query.id,

                    {
                        text:
                            '⏳ PUBLICANDO FOTO...'
                    }
                )

                const media =
                    datos.media

                const texto =
                    datos.texto

                if (!fs.existsSync('./temp')) {

                    fs.mkdirSync('./temp')
                }

                const imagenPath =
                    `./temp/${id}.png`

                const salidaPath =
                    `./temp/${id}_final.png`

                fs.writeFileSync(

                    imagenPath,

                    Buffer.from(
                        media.data,
                        'base64'
                    )
                )

                const imagen =
                    await Jimp.read(
                        imagenPath
                    )

                const logo =
                    await Jimp.read(
                        './watermark.png'
                    )

                logo.resize(
                    imagen.bitmap.width * 0.55,
                    Jimp.AUTO
                )

                logo.opacity(0.30)

                const x =

                    (imagen.bitmap.width -
                        logo.bitmap.width) / 2

                const y =

                    (imagen.bitmap.height -
                        logo.bitmap.height) / 2

                imagen.composite(
                    logo,
                    x,
                    y
                )

                await imagen.writeAsync(
                    salidaPath
                )

                await delay(2000)

                const mediaFinal =
                    MessageMedia.fromFilePath(
                        salidaPath
                    )

                await delay(5000)

                for (const destino of DESTINOS) {

                    await client.sendMessage(

                        destino,

                        mediaFinal,

                        {

                            caption:
                                `${HEADER}${texto}

📍 Más información próximamente`
                        }
                    )
                }

                console.log(
                    '✅ FOTO PUBLICADA'
                )

                if (fs.existsSync(imagenPath)) {
                    fs.unlinkSync(imagenPath)
                }

                if (fs.existsSync(salidaPath)) {
                    fs.unlinkSync(salidaPath)
                }

                delete mensajesPendientes[id]
            }

            // CANCELAR

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

            try {

                await bot.answerCallbackQuery(

                    query.id,

                    {
                        text:
                            '❌ ERROR'
                    }
                )

            } catch { }
        }
    })

// ======================================
// ERRORES
// ======================================

process.on('unhandledRejection', err => {

    console.log(err)
})

process.on('uncaughtException', err => {

    console.log(err)
})

// ======================================
// INICIAR
// ======================================

console.log('\n🚀 PANEL ACTIVO\n')

client.initialize()