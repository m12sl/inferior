/**
 * Объект для биндинга событий загрузке файлов: drag-n-drop и change
 * @type {Object}
 */
var dragdrop = {
    _callback: null,

    init: function (elem, callback) {
        elem.setAttribute('onchange', 'dragdrop.change(event)');
        elem.setAttribute('ondrop', 'dragdrop.drop(event)');
        elem.setAttribute('ondragover', 'dragdrop.drag(event)');
        _callback = callback;
    },
    change: function (e) {
        e.preventDefault();
        var file = e.target.files[0];
        _callback(file);
    },
    drop: function (e) {
        e.preventDefault();
        var file = e.dataTransfer.files[0];
        _callback(file);
    },
    drag: function (e) {
        e.preventDefault();
    }
};

/**
 * Отрисовывает картинку из загруженного файла `file`
 * выполняет `callback` при успешной загрузке
 * @param file
 * @param callback
 * @returns {Promise}
 */
function loadSourceImageFromFile(file, callback) {
    var reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = function (_file) {
        loadSourceImage(_file.target.result, function(image) {
            callback && callback.call(image, image);
        })
    }
}

/**
 * Загружает исходную картинку по урлу `src`,
 * выполняет `callback` при успешной загрузке
 * @param src
 * @param callback
 */
function loadSourceImage(src, callback) {
    //var $sourceImage = document.getElementById("original"); //$('.source__image');
    var $sourceImage = $('#original');
    $sourceImage
        .one('load', function () {
            $sourceImage.show();
            // $('.source').addClass('source__loaded');
            callback && callback.call(this, this);
        })
        .attr('src', src)
}

/**
 * Загружает base64-закодированную картинку POST-запросом на сервер
 * Получает ответ с линком и добавляет его в processed
 * @param img
 * @returns {Promise<void>}
 */
async function processImage(img) {
    const startTime = performance.now();
    const url = "/handle";
    const resp = await fetch(url, {
        method: "POST",
        body: img.currentSrc
    });
    const jsonData = await resp.json();
    console.log(jsonData);

    const link = jsonData["result"];
    document.getElementById("processed").src = jsonData["result"];
    console.log(`It takes ${((performance.now() - startTime) / 1000).toFixed(2)}s to process image`);
}


/**
 * Загрузка страницы
 */
$(function () {
    /**
     * Обработчик загрузки файла
     */
    dragdrop.init(document.querySelector('.dropzone'), function (file) {
        loadSourceImageFromFile(file, function(image) {
            // loadResultPreview(image);

            setTimeout(function () {
                processImage(image);
            }, 50);
        })
    });
});
