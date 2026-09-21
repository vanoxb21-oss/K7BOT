const { 
    Client, 
    GatewayIntentBits, 
    Partials, 
    EmbedBuilder, 
    PermissionFlagsBits 
} = require('discord.js');

// إنشاء العميل وتفعيل النوايا (Intents)
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildPresences
    ],
    partials: [Partials.Channel, Partials.Message, Partials.Reaction]
});

// قاعدة بيانات بسيطة في الذاكرة لنظام اللفلات
const userXP = new Map();

// بنك أسئلة وألعاب موسع
const questions = {
    wouldYouRather: [
        "لو خيروك: تعيش بدون إنترنت لمدة سنة ولا تعيش بدون موبايل لمدة سنتين؟",
        "لو خيروك: تسافر المستقبل وتشوف حياتك ولا ترجع الماضي وتصلح غلطة؟",
        "لو خيروك: تكون عندك قدرة الطيران ولا قدرة الاختفاء؟",
        "لو خيروك: تاكل أكلتك المفضلة طول حياتك ولا ما تاكلهاش خالص تاني؟",
        "لو خيروك: تعيش في مدينة تحت المية ولا مدينة في الفضاء؟",
        "لو خيروك: تعرف تفكر باللغة اللي أنت عايزها ولا تتكلم كل لغات العالم؟",
        "لو خيروك: تلعب في الدوري الإسباني ولا الدوري الإنجليزي؟",
        "لو خيروك: تكسب 100 ألف دولار دلوقتي ولا مليون دولار بعد 5 سنين؟",
        "لو خيروك: تكون مشهور جداً ومحدش يسيبك في حالك ولا غني جداً ومحدش يعرفك؟",
        "لو خيروك: تعيش الصيف طول السنة ولا الشتا طول السنة؟"
    ],
    saraha: [
        "إيه أكتر موقف أحرجك في حياتك؟",
        "مين أكتر شخص بتثق فيه في السيرفر هنا؟",
        "إيه هي الحلم اللي لسة ما حققتوش لحد دلوقتي؟",
        "هل تعتقد إنك شخص سهل التعامل معاه؟",
        "إيه أكتر عادة فيك نفسك تغيرها؟",
        "مين الشخص اللي غير مجرى حياتك للأفضل؟",
        "لو تقدر ترجع الزمن، إيه قرار كنت هتغيره فوراً؟",
        "إيه أكتر حاجة بتخاف منها في المستقبل؟",
        "هل سبق وخنت ثقة حد كان قريب منك؟",
        "إيه هو الشيء اللي ما تقدرش تسامح فيه أبداً؟"
    ],
    trivia: [
        { q: "ما هي عاصمة مصر؟", a: "القاهرة" },
        { q: "كم عدد قارات العالم؟", a: "7" },
        { q: "ما هو أطول نهر في العالم؟", a: "نهر النيل" },
        { q: "ما هو أكبر كوكب في المجموعة الشمسية؟", a: "المشتري" },
        { q: "من هو الهداف التاريخي لدوري أبطال أوروبا؟", a: "رونالدو" },
        { q: "ما هي الدولة الأكثر تسجيلاً لأهداف في كأس العالم؟", a: "البرازيل" },
        { q: "كم عدد أضلاع المسدس؟", a: "6" },
        { q: "ما هو أسرع حيوان بري في العالم؟", a: "الفهد" },
        { q: "ما هو المحيط الأكبر في العالم؟", a: "الهادي" },
        { q: "في أي عام انتهت الحرب العالمية الثانية؟", a: "1945" },
        { q: "ما هي عاصمة السعودية؟", a: "الرياض" },
        { q: "ما هي عاصمة فرنسا؟", a: "باريس" }
    ]
};

// عند تشغيل البوت بنجاح
client.once('ready', () => {
    console.log(`✅ تم تشغيل البوت بنجاح باسم: ${client.user.tag}`);
    client.user.setActivity('سيرفر K7 Egypt 🛡️ | !help', { type: 3 });
});

// ==========================================
// 1. نظام الترحيب والرتب التلقائية (Welcome)
// ==========================================
client.on('guildMemberAdd', async (member) => {
    const welcomeChannel = member.guild.channels.cache.find(c => c.name.includes('welcome') || c.name.includes('ترحيب'));

    if (welcomeChannel) {
        const welcomeEmbed = new EmbedBuilder()
            .setColor('#00ffff')
            .setTitle(`🎉 أهلاً بك في سيرفر ${member.guild.name}!`)
            .setDescription(`نورت السيرفر يا <@${member.id}>! نتمنى لك وقتاً ممتعاً معنا.\nأنت العضو رقم **${member.guild.memberCount}** في السيرفر.`)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setTimestamp()
            .setFooter({ text: 'K7 Egypt System' });

        welcomeChannel.send({ embeds: [welcomeEmbed] });
    }

    const defaultRole = member.guild.roles.cache.find(r => r.name === 'Member' || r.name === 'عضو' || r.name === 'Bronze');
    if (defaultRole) {
        member.roles.add(defaultRole).catch(console.error);
    }
});

// ==========================================
// 2. الحماية، اللفلات، والأوامر العامة
// ==========================================
client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;

    // --- أ) نظام الحماية ضد الروابط الإعلانية (Anti-Links) ---
    const linkRegex = /(https?:\/\/[^\s]+)/g;
    if (linkRegex.test(message.content)) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            await message.delete().catch(() => {});
            const warningMsg = await message.channel.send(`⚠️ يمنع إرسال الروابط الإعلانية يا <@${message.author.id}>!`);
            setTimeout(() => warningMsg.delete().catch(() => {}), 5000);
            return;
        }
    }

    // --- ب) نظام اللفلات والـ XP ---
    const userId = message.author.id;
    let currentData = userXP.get(userId) || { xp: 0, level: 1 };
    
    const addedXP = Math.floor(Math.random() * 15) + 10;
    currentData.xp += addedXP;

    const nextLevelXP = currentData.level * 100;
    if (currentData.xp >= nextLevelXP) {
        currentData.level += 1;
        message.channel.send(`🎉 مبروك يا <@${userId}>! صعدت إلى **المستوى ${currentData.level}** 🚀`);
    }

    userXP.set(userId, currentData);

    // --- ج) الأوامر التفاعلية والألعاب ---
    const prefix = '!';
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // أمر المساعدة
    if (command === 'help' || command === 'مساعدة') {
        const helpEmbed = new EmbedBuilder()
            .setColor('#7289da')
            .setTitle('📜 قائمة أوامر K7BOT')
            .addFields(
                { name: '📊 التفاعل واللفلات', value: '`!rank` - معرفة مستواك ونقاطك' },
                { name: '🎮 الألعاب والمسابقات', value: '`!خيروك` - لعبة لو خيروك\n`!صراحة` - أسئلة صراحة\n`!سؤال` - سؤال معلومات عامة' },
                { name: '🛡️ الإدارة والحماية', value: '`!clear [عدد]` - مسح الرسائل\n`!kick [@عضو]` - طرد عضو\n`!ban [@عضو]` - حظر عضو' }
            )
            .setFooter({ text: 'K7 Egypt Server' });
        return message.reply({ embeds: [helpEmbed] });
    }

    // أمر معرفة المستوى/الرتبة
    if (command === 'rank' || command === 'لفل') {
        const userData = userXP.get(userId) || { xp: 0, level: 1 };
        const rankEmbed = new EmbedBuilder()
            .setColor('#ffaa00')
            .setTitle(`🏅 بطاقة المستوى لـ ${message.author.username}`)
            .addFields(
                { name: 'المستوى الحالي (Level)', value: `**${userData.level}**`, inline: true },
                { name: 'نقاط الخبرة (XP)', value: `**${userData.xp} / ${userData.level * 100}**`, inline: true }
            )
            .setThumbnail(message.author.displayAvatarURL());
        return message.reply({ embeds: [rankEmbed] });
    }

    // لعبة لو خيروك
    if (command === 'خيروك') {
        const randomQ = questions.wouldYouRather[Math.floor(Math.random() * questions.wouldYouRather.length)];
        const embed = new EmbedBuilder()
            .setColor('#e91e63')
            .setTitle('🤔 لو خيروك؟')
            .setDescription(randomQ);
        return message.channel.send({ embeds: [embed] });
    }

    // لعبة صراحة
    if (command === 'صراحة') {
        const randomQ = questions.saraha[Math.floor(Math.random() * questions.saraha.length)];
        const embed = new EmbedBuilder()
            .setColor('#9b59b6')
            .setTitle('💬 سؤال صراحة')
            .setDescription(randomQ);
        return message.channel.send({ embeds: [embed] });
    }

    // لعبة الأسئلة العامة
    if (command === 'سؤال') {
        const randomTrivia = questions.trivia[Math.floor(Math.random() * questions.trivia.length)];
        message.channel.send(`❓ **سؤال:** ${randomTrivia.q}\n*(أول شخص يكتب الإجابة صح يكسب!)*`);

        const filter = m => m.content.toLowerCase().includes(randomTrivia.a.toLowerCase());
        const collector = message.channel.createMessageCollector({ filter, time: 15000, max: 1 });

        collector.on('collect', m => {
            message.channel.send(`🎉 إجابة صحيحة من <@${m.author.id}>! الإجابة هي: **${randomTrivia.a}**`);
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                message.channel.send(`⏰ انتهى الوقت! الإجابة الصحيحة كانت: **${randomTrivia.a}**`);
            }
        });
    }

    // --- د) الأوامر الإدارية ---
    if (command === 'clear' || command === 'مسح') {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return message.reply('❌ ليس لديك صلاحية مسح الرسائل!');
        }
        const amount = parseInt(args[0]);
        if (isNaN(amount) || amount < 1 || amount > 100) {
            return message.reply('يرجى تحديد عدد الرسائل بين 1 و 100.');
        }
        await message.channel.bulkDelete(amount, true);
        const msg = await message.channel.send(`✅ تم مسح **${amount}** رسالة بنجاح.`);
        setTimeout(() => msg.delete().catch(() => {}), 3000);
    }
});

// ==========================================
// 3. تسجيل الدخول بالتوكن
// ==========================================
const TOKEN = process.env.TOKEN || 'ضع_التوكن_هنا';
client.login(TOKEN);
