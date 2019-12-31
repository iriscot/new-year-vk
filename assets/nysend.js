// NEW YEAR SEND SCRIPT
// by Iriscot 2015 - Present
// License: MIT


config = {

    // Получите токен по ссылке
    // ВНИМАНИЕ: токен, полученный по этой ссылке действителен в течение 24 часов в целях безопасности
    // https://oauth.vk.com/authorize?client_id=2685278&display=page&redirect_uri=https://oauth.vk.com/blank.html&scope=messages&response_type=token
    // Используйте ссылку ниже для получения постоянного токена
    // https://oauth.vk.com/authorize?client_id=2685278&display=page&redirect_uri=https://oauth.vk.com/blank.html&scope=messages,offline&response_type=token
    // После подтверждения доступа, в адресной строке браузера появится такой адрес:
    // https://oauth.vk.com/blank.html#access_token=[куча букв и цифр]&expires_in=86400&user_id=[ваш id]
    // Вот эта куча цифр и букв и есть токен, вставляйте его сюда:

    token: '0f6503e036024fc46c25038df62474976213ed6e80fb4f054b472a4e1fb2e640626047ccdd3617934a3db0',


    // Сообщение, которое будет отправлено в новый год

    message: 'С новым годом! ✨✨✨',

    // Массив получателей. В квадратных скобках перечислите id пользователей через запятую.
    // Чтобы узнать id, откройте диалог с пользователем. Смотрите в адресную строку
    // https://vk.com/im?sel=[здесь id собеседника]

    recipients: [228587222, 407962776],


    // Когда отправлять (объект moment.js)
    // Используйте moment().add(1, 'year').startOf('year') для обозначения 1 января следующего года

    whenToSend: moment().add(1, 'year').startOf('year'),


    // Интервал между отправками сообщений в миллисекундах

    interval: 800,
}


// Обращение к VK API
function callApi(method, params = {}) {
    params.access_token = config.token;
    params.v = 5.103;
    return new Promise(function(resolve, reject) {
        $.ajax({
            url: "https://api.vk.com/method/" + method + "?" + $.param(params),
            type: "GET",
            dataType: "jsonp",
            success: (resp) => {
                (typeof resp.response != 'undefined') ? resolve(resp.response): reject(resp.error);
            }
        });
    });
}

// Выбирает числительное, соответствующее числу.
// declOfNum(2, 'собака', 'собаки', 'собак') вернет «собаки», потому что «две собаки».
function declOfNum(number, titles) {
    cases = [2, 0, 1, 1, 1, 2];
    return titles[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[(number % 10 < 5) ? number % 10 : 5]];
}

// Проверка возможности отправлять сообщения
function testfire() {
    if (confirm('Для проверки возможности отправки сообщений, в диалог с самим собой будет отправлено сообщение с текстом «Тест».')) {
        callApi('messages.send', {
            user_id: config.uid,
            random_id: Math.floor(Math.random() * Math.pow(10, 16)),
            message: 'Тест',
        }).then(function() {
            alert('Вроде отправилось');
        }, function(e) {
            alert('Произошла ошибка: ' + e.error_msg);
        })
    }
}

// Запуск скрипта
function start() {
    updateInterval = setInterval(function() {
        if (moment().isSameOrAfter(config.whenToSend)) { // если новый год
            clearInterval(updateInterval);
            var successCount = 0;
            config.recipients.forEach(function(user, i) {
                setTimeout(function() {
                    callApi('messages.send', {
                        user_id: user,
                        random_id: Math.floor(Math.random() * Math.pow(10, 16)),
                        message: config.message,
                    }).then(function() {
                        console.log('Отправлено для id' + user);
                        successCount++;
                        $('.lifehacks').html(`Сообщения отправлены для ${successCount} ${declOfNum(successCount, ['получатель', 'получателей', 'получателей'])} из ${config.recipients.length}.`);
                    });
                }, i * config.interval + 1);
            });
        }
    }, 500);
    $('.infoline#info-status').find('.circleIndicator').removeClass('error').addClass('success');
    $('.infoline#info-status').find('.infoline__value').text(`Скрипт работает`);
    $('.lifehacks').html('Оставьте эту вкладку открытой и отдыхайте :) С новым годом!');
}

// Информация о получателях
$('.infoline#info-recipients').find('.infoline__caption').text(`${config.recipients.length} ${declOfNum(config.recipients.length, ['получатель', 'получателя', 'получателей'])}`);
$('.infoline#info-recipients').find('.infoline__value').text(`[${config.recipients.join(', ')}]`);

// Получаем аватарку и имя пользователя, заодно проверяем токен
callApi('users.get', {
    fields: 'photo_50'
}).then(function(user) {
    $('.infoline#info-token').find('.circleIndicator').addClass('success');
    $('.infoline#info-token').find('.infoline__value').text(`Токен годный`);
    $('.vkmessage_preview__avatar img').attr('src', user[0].photo_50);
    $('.vkmessage_preview__username').text(`${user[0].first_name}`);
    config.uid = user[0].id;
}, function(e) {
    $('.infoline#info-token').find('.circleIndicator').addClass('error');
    $('.infoline#info-token').find('.infoline__value').text(`Токен не годный! Замените`);
    $('.lifehacks').html('Отредактируйте скрипт <strong>nysend.js</strong> из папки assets и обновите страницу.');
});

// Вывод времени отправки
$('.infoline#info-willsend').find('.infoline__value').text(config.whenToSend.format("D MMMM YYYY, H:mm:ss"));

// Вывод текущего и оставшегося времени раз в секунду
clockInterval = setInterval(function() {
    $('.infoline#info-remaining').find('.infoline__value').text(moment().to(config.whenToSend));
    $('.infoline#info-now').find('.infoline__value').text(moment().format("D MMMM YYYY, H:mm:ss"));
}, 1000);

// Вывод текста сообщения
$('.vkmessage_preview__text').text(config.message);
