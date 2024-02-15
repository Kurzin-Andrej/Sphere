import * as THREE from 'https://cdn.skypack.dev/three@0.136.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/renderers/CSS2DRenderer.js';

const container = document.getElementById('canvas');

//создаем сцену
const scene = new THREE.Scene();
let center = new THREE.Vector3(0, 0, 0);

// Создаем новую камеру camera с помощью конструктора THREE.PerspectiveCamera().
// Камера определяет, какая часть сцены будет видна на экране. Параметры конструктора:
// угол обзора (75 градусов), соотношение сторон контейнера, ближняя плоскость отсечения (0.1)
// и дальняя плоскость отсечения (1000).
// Изменяя угол обзора можно отдалять и приближать объект
const camera = new THREE.PerspectiveCamera(75, container.offsetWidth / container.offsetHeight, 0.1, 1000);
camera.position.set(0, 0, 0);

// Создаем новый рендерер renderer с помощью конструктора THREE.WebGLRenderer().
// Рендерер отвечает за отображение сцены на экране.
// {alpha: true} делает сцену прозрачной
const renderer = new THREE.WebGLRenderer({alpha: true, antialias: true });
//Установка размеров рендера
renderer.setSize(container.offsetWidth, container.offsetHeight);
container.appendChild(renderer.domElement);

// Создаем геометрию сферы geometry с помощью конструктора THREE.SphereGeometry().
// Параметры конструктора: радиус (1), количество сегментов по ширине (64) и количество сегментов по высоте (64).
// (количество сегментов можно увеличивать и уменьшать, от этого будет зависеть гладкость сферы)
const geometry = new THREE.SphereGeometry(2, 64, 64);

//Создание материала для сферы
const textureLoader = new THREE.TextureLoader();
//Загружаем текстуру планеты для сферы
const texture = textureLoader.load('./img/1625895814_13-kartinkin-com-p-tekstura-planeti-krasivo-16.jpg');

// Создаем материал с использованием текстуры
const material = new THREE.MeshBasicMaterial({ map: texture });
const sphere = new THREE.Mesh(geometry, material);

scene.add(sphere);
camera.position.z = 5;

const markerCount = 2;
let rad = 2; //радиус сферы
let markerInfo = []; // информация о метках
let gMarker = new THREE.CircleGeometry(0.09, 16); // круговая геометрия
let mMarker = new THREE.MeshBasicMaterial({
    color: 0xff0000 // красный цвет
});
mMarker.defines = { USE_UV: " " }; // needed to be set to be able to work with UVs
let markers = new THREE.InstancedMesh(gMarker, mMarker, markerCount);

//задал тестовые позиции для меток, мо
const positions = [[51.507, -0.1278],[55.507, -3.1278]]
// Создание пустого объекта dummy
let dummy = new THREE.Object3D();

// Создание пустого массива phase
let phase = [];

// Цикл, который выполняется markerCount раз
for (let i = 0; i < markerCount; i++) {
    // Получение координат из массива testPos по индексу i
    const position = positions[i];

    // Конвертация реальных координат в координаты для сферы
    const lat = position[0];
    const lon = position[1];
    const radius = 1;

    // Преобразование широты и долготы в радианы
    const latRad = (lat * Math.PI) / 180;
    const lonRad = (lon * Math.PI) / 180;

    // Вычисление координат x, y, z на сфере
    const x = radius * Math.cos(latRad) * Math.cos(lonRad);
    const y = radius * Math.sin(latRad);
    const z = radius * Math.cos(latRad) * Math.sin(lonRad);

    // Создание вектора direction с координатами x, y, z
    const direction = new THREE.Vector3(x, y, z);

    // Установка длины вектора direction равной rad
    direction.setLength(rad);

    // Копирование координат вектора direction в позицию объекта dummy
    dummy.position.copy(direction);

    // Направление объекта dummy на точку, удаленную на расстояние rad + 1 от его позиции
    dummy.lookAt(dummy.position.clone().setLength(rad + 1));

    // Обновление матрицы объекта dummy
    dummy.updateMatrix();

    // Установка матрицы объекта dummy в массиве markers по индексу i
    markers.setMatrixAt(i, dummy.matrix);

    // Добавление случайного числа в массив phase
    phase.push(Math.random());

    // Добавление информации о маркере в массив markerInfo
    markerInfo.push({
        id: i + 1,
        mag: THREE.MathUtils.randInt(1, 10),
        crd: dummy.position.clone()
    });
}

// Установка атрибута "phase" элемента gMarker
// с использованием нового экземпляра класса THREE.InstancedBufferAttribute
// и передачей массива phase в качестве данных атрибута
// THREE.InstancedBufferAttribute - это класс в Three.js, который представляет собой буферный атрибут,
// содержащий данные для каждого экземпляра объекта. В данном случае, создается новый экземпляр InstancedBufferAttribute
// с использованием массива Float32Array(phase) в качестве данных и размером 1 для каждого экземпляра.
// Атрибут "phase" может быть использован для хранения информации о фазе или состоянии объекта gMarker,
// которая может быть использована в дальнейшей обработке или отображении объекта.
gMarker.setAttribute(
    "phase",
    new THREE.InstancedBufferAttribute(new Float32Array(phase), 1)
);

sphere.add(markers);

// Переменные для хранения состояния клика и начальных координат мыши
let isClicked = false;
let startX = 0;
let startY = 0;
let prevX = 0;
let prevY = 0;

// Добавляем обработчик события нажатия кнопки мыши
container.addEventListener('mousedown', function(event) {
    // Проверяем, что нажата левая кнопка мыши
    if (event.button === 0) {
        // Устанавливаем флаг клика и сохраняем начальные координаты мыши
        isClicked = true;
        startX = event.clientX;
        startY = event.clientY;
        prevX = startX;
        prevY = startY;
    }
});

// Добавляем обработчик события отпускания кнопки мыши
document.addEventListener('mouseup', (event) => {
    // Проверяем, что отпущена левая кнопка мыши
    if (event.button === 0) {
        // Сбрасываем флаг клика
        isClicked = false;
    }
});

// Добавляем обработчик события перемещения мыши
document.addEventListener('mousemove', (event) => {
    // Проверяем, что зажата левая кнопка мыши
    if (isClicked) {
        // Получаем текущие координаты мыши
        const currentX = event.clientX;
        const currentY = event.clientY;

        // Вычисляем разницу между текущими и начальными координатами мыши
        const deltaX = currentX - prevX;
        const deltaY = currentY - prevY;

        // Вычисляем углы поворота сферы на основе разницы координат мыши
        const rotationAngleX = deltaY * 0.01; // Угол поворота по оси X
        const rotationAngleY = deltaX * 0.01; // Угол поворота по оси Y

        // Создаем кватернион для поворота сферы
        // кватернионы нужны для корректного вращения
        // (грубо говоря, они оставляют оси координат на месте, не вращая их вместе со сферой)
        const quaternionX = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), rotationAngleX);
        const quaternionY = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), rotationAngleY);

        // Применяем кватернионы поворота к сфере
        sphere.quaternion.premultiply(quaternionX);
        sphere.quaternion.premultiply(quaternionY);

        // Обновляем предыдущие координаты мыши
        prevX = currentX;
        prevY = currentY;
    }
});

 //Добавил как пример увеличение и уменьшение сфера на примере прокрутки колесика
document.addEventListener('wheel', (event) => {
     //Получаем значение прокрутки колесика мыши
    const delta = event.deltaY;

    // Изменяем радиус вращения камеры на основе значения прокрутки колесика мыши
    const radius = camera.position.distanceTo(center);

    //коэффициент у delta отвечает за скорость изменения радиуса обзора сцены
    let newRadius = radius - delta * -0.001;

    // Ограничиваем минимальное значение радиуса
    const minRadius = 1;
    if (newRadius < minRadius) {
        newRadius = minRadius;
    }

    // Вычисляем новую позицию камеры
    const direction = camera.position.clone().sub(center).normalize();
    camera.position.copy(center).add(direction.multiplyScalar(newRadius));

    // Обновляем радиус вращения камеры
    camera.lookAt(center);
});


// Сдвиг сферы вверх
document.getElementById('higher').addEventListener('click', () => {
    scene.position.y += 0.1;
})

// Сдвиг сферы вниз
document.getElementById('below').addEventListener('click', () => {
    scene.position.y -= 0.1;
})

// Сдвиг сферы влево
document.getElementById('left').addEventListener('click', () => {
    scene.position.x -= 0.1;
})

// Сдвиг сферы вправо
document.getElementById('right').addEventListener('click', () => {
    scene.position.x += 0.1;
})

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();