window.nativeAlert = window.alert;

function crearModalAlerta(titulo, mensaje, tipo = 'default', autoCerrar = false, callback = null) {
    if (document.querySelector('.custom-alert-overlay')) return;

    const overlay = document.createElement('div');
    overlay.className = 'custom-alert-overlay';

    const box = document.createElement('div');
    box.className = `custom-alert-box ${tipo}`;

    const titleElem = document.createElement('div');
    titleElem.className = 'custom-alert-title';
    titleElem.innerText = titulo;

    const msgElem = document.createElement('div');
    msgElem.className = 'custom-alert-message';
    msgElem.innerText = mensaje;

    box.appendChild(titleElem);
    box.appendChild(msgElem);

    if (!autoCerrar) {
        const btn = document.createElement('button');
        btn.className = 'custom-alert-btn';
        btn.innerText = 'Aceptar';
        btn.onclick = function () {
            document.body.removeChild(overlay);
            if (callback) callback();
        };
        box.appendChild(btn);
    } else {
        setTimeout(() => {
            if (document.body.contains(overlay)) {
                document.body.removeChild(overlay);
                if (callback) callback();
            }
        }, 1000);
    }

    overlay.appendChild(box);
    document.body.appendChild(overlay);
}

window.alert = function (message) {
    crearModalAlerta('Aviso', message, 'default', false);
};

window.alertaExito = function (message, callback) {
    crearModalAlerta('¡Éxito!', message, 'success', true, callback);
};