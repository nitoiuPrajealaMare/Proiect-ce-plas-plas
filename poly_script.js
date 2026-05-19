let n = 7, Bound = 20, solutionId = 0, solOpen = false, GRAPH_COLOR = 'red';
const coef = [0, -8, 0, 14, 0, -7, 0, 1], rad = [];

const coefContainer = document.getElementById('coef-container');
const rangeContainer = document.getElementById('range-container');
const rangeInput = rangeContainer.querySelector('input');
const sizeHeader = rangeContainer.querySelector('h1');

const storage = localStorage.getItem('polinom');
if(storage != null) {
    const { n: saved_n, coef: saved_coef } = JSON.parse(storage);
    n = saved_n;
    sizeHeader.textContent = 'Grad: ' + n;
    rangeInput.value = n;
    updateSlider();

    while(coef.length > 0) coef.pop(); 
    if(saved_coef.length > 0 && saved_coef.filter(c => c == 0).length < n + 1)
        for(let i = 0; i <= n; i++) coef.push(saved_coef[i]);
}

const point = {x: 0, y: 0};
const xInputContainer = document.getElementById('x-input-container');
const xInput = xInputContainer.querySelectorAll('input')[0];
const yInput = xInputContainer.querySelectorAll('input')[1];

function update_point()
{
    const x = Number(xInput.value);
    if(isNaN(x)) {
        point.x = 0;
        point.y = convert_sol(calculPolinom(coef, n, 0), 4);
        yInput.value = point.y;
        return;
    }
    point.x = x;
    point.y = convert_sol(calculPolinom(coef, n, x), 4);
    yInput.value = point.y;
}

xInput.addEventListener('input', () => { update_point(); draw_poly(); });


function draw_point()
{
    const cx = toCanvasX(point.x), cy = toCanvasY(point.y);
    ctx.fillStyle = GRAPH_COLOR;
    ctx.beginPath();
    ctx.arc(cx, cy, 80 / Bound, 0, 2 * Math.PI);
    ctx.fill();

    if(point.y != 0 && point.x != 0){
        ctx.beginPath();
        ctx.strokeStyle = GRAPH_COLOR;
        ctx.lineWidth = Math.sqrt(40 / Bound);
        const delta_dist =point.x / 20;
        
        const upper = point.x > 0 ? point.x - delta_dist : 0;
        const lower = point.x > 0 ? 0 : point.x - delta_dist;
        for(let x = lower; x <= upper; x += 2 * Math.abs(delta_dist)) {
            ctx.moveTo(toCanvasX(x), cy);
            ctx.lineTo(toCanvasX(x + delta_dist), cy);
        }
        ctx.stroke();
        ctx.lineWidth = 2;
    }
}

const colorSelector = document.getElementById('color-selector');
colorSelector.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
        GRAPH_COLOR = btn.id.split('-')[1];
        colorSelector.querySelectorAll('button').forEach(b => b.style.opacity = '0.5');
        btn.style.opacity = 1;
        draw_poly();
    });
});

const solutionHolder = document.getElementById('solution-holder');
solutionHolder.addEventListener('mousedown', (event) => {
    const offset = {
        x: solutionHolder.offsetLeft - event.clientX, 
        y: solutionHolder.offsetTop - event.clientY
    };

    function mouseMove(event){
        const nx = event.clientX + offset.x;
        const ny = event.clientY + offset.y;
        solutionHolder.style.left = nx + 'px';
        solutionHolder.style.top = ny + 'px';
    }

    function mouseUp() {
        document.removeEventListener('mousemove', mouseMove);
        document.removeEventListener('mouseup', mouseUp);
    }

    document.addEventListener('mousemove', mouseMove);
    document.addEventListener('mouseup', mouseUp);
});


document.body.addEventListener('mousedown', event => {
    if(Number(solutionHolder.style.opacity) < 1)
        return;

    const x = event.clientX, y = event.clientY;
    const {left, right, top, bottom} = solutionHolder.getBoundingClientRect();

    if(x < left || x > right || y < top || y > bottom) 
    {
        solutionHolder.style.opacity = '0';
        solutionHolder.style.animation = 'fade-out 0.2s linear';
        setTimeout(() => {
            solutionHolder.style.display = 'none'; 
            solutionHolder.style.top = '50%';
            solutionHolder.style.left = `calc(50% + ${200}px)`;
            solOpen = false;
        }, 200);
        canvas.style.opacity = '1';
        canvas.style.filter = 'brightness(1)';
        Array.from(document.querySelectorAll('.side-btn'))
            .forEach(btn => {
                btn.style.pointerEvents = 'all';
                btn.style.opacity = '1';
                btn.style.filter = 'brightness(1)';
            });
    }
});


function convert_sol(val, precision = 5){
    console.log(val, typeof val == 'number');
    let string = val.toFixed(precision).toString();
    while(string[string.length - 1] == '0')
        string = string.slice(0, string.length - 1);
    return Number(string);
}

document.getElementById('see-sol-btn').addEventListener('click', () => {
    if(rad.length == 0) return;

    solOpen = true;
    solutionHolder.style.opacity = '1';
    solutionHolder.style.animation = 'fade-in 0.2s linear';
    solutionHolder.style.display = 'flex';

    while(solutionHolder.querySelector('h2') != null)
        solutionHolder.querySelector('h2').remove();

    rad.forEach(({ val, ord }) => {
        const header = document.createElement('h2');
        header.textContent = `${convert_sol(val)} de ordin ${ord}`;
        header.className = 'solution-display';
        solutionHolder.appendChild(header);
    });

    canvas.style.opacity = '0.2';
    canvas.style.filter = 'brightness(0.95)';

    Array.from(document.querySelectorAll('.side-btn'))
        .forEach(btn => {
            btn.style.pointerEvents = 'none';
            btn.style.opacity = '0.5';
            btn.style.filter = 'brightness(0.95)';
        });
});


const canvas = document.querySelector('canvas');
const ctx = canvas.getContext("2d");

canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

let offset_x = 0, offset_y = 0;
let mouseX, mouseY;


function zoom(out) {
    if(out)
        Bound = Bound < 60 ? Bound + 2 : Bound;

    else Bound = Bound > 6 ? Bound - 2 : Bound;

    draw_poly();
    rad.forEach(({ id }) => {
        if(document.getElementById(id) != null)
            document.getElementById(id).remove();
    });
    check_solutions();
}

canvas.addEventListener('wheel', event => { if(!solOpen) zoom(event.deltaY > 0); });

document.getElementById('zoom-in-btn').addEventListener('click', () => zoom(false));
document.getElementById('zoom-out-btn').addEventListener('click', () => zoom(true));


function mouseDown(event)
{
    let x = event.clientX, y = event.clientY;

    function mouseMove(event)
    {
        if(event.target.id != 'canvas') {
            mouseUp();
            return;
        }
        const nx = event.clientX, ny = event.clientY;
        offset_x += nx - x;
        offset_y += ny - y;
        x = nx; y = ny;

        draw_poly();
        rad.forEach(({ id }) => {
            if(document.getElementById(id) != null)
                document.getElementById(id).remove();
        });
        check_solutions();
    }

    function mouseUp()
    {
        document.removeEventListener('mousemove', mouseMove);
        canvas.removeEventListener('mouseup', mouseUp);
    }

    document.addEventListener('mousemove', mouseMove);
    canvas.addEventListener('mouseup', mouseUp);
}

canvas.addEventListener('mousedown', mouseDown);


document.getElementById('reset-btn').addEventListener('click', () => {
    for(let i = 0; i <= n; i++)
        coef[i] = 0;
    Array.from(coefContainer.querySelectorAll('.coef-input'))
        .forEach(coefInp => {
            coefInp.querySelector('input').value = "";
        });
    while(rad.length > 0) rad.pop();
    clear_graph();
});

function get_grid() {
    return {
        x: 2.5 * Bound,
        y: 2.5 * Bound * canvas.height / canvas.width
    };
}

function draw_grid()
{
    const grid_size = get_grid();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgb(200, 200, 200)"
    ctx.beginPath();

    const delta_x = canvas.width / grid_size.x;
    let x = offset_x + canvas.width / 2 + delta_x;
    while(x < canvas.width)
    {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        x += delta_x;
    }
    x = offset_x + canvas.width / 2 - delta_x;
    while(x > 0)
    {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        x -= delta_x;
    }
    
    const delta_y = canvas.height / grid_size.y;
    let y = offset_y + delta_y + canvas.height / 2;
    while(y < canvas.height)
    {
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        y += delta_y;
    }
    y = offset_y  + canvas.height / 2 - delta_y;
    while(y > 0)
    {
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        y -= delta_y;
    }
    ctx.stroke();
}


function clear_graph()
{
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    draw_grid();

    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;

    ctx.moveTo(0, canvas.height / 2 + offset_y);
    ctx.lineTo(canvas.width, canvas.height / 2 + offset_y);

    ctx.moveTo(canvas.width / 2 + offset_x, 0);
    ctx.lineTo(canvas.width / 2 + offset_x, canvas.height);

    ctx.stroke();
}

function mark_solutions()
{
    if(rad.length == 0) return;
    ctx.fillStyle = "rgb(120, 120, 120)";
    
    ctx.beginPath();
    rad.forEach(({ val: val })=> {
        ctx.arc(toCanvasX(val), toCanvasY(0), 80 / Bound, 0, 2 * Math.PI);
    });
    ctx.fill();
}


function toCanvasX(x)
{
    return (x + Bound) * canvas.width / (2 * Bound) + offset_x;
}

function toCanvasY(y)
{
    return canvas.height / 2 - y * 400 / Bound + offset_y;
}


function draw_poly()
{
    clear_graph();
    if(coef.filter(e => e == 0).length == n + 1)
        return;

    let x, y, nx, ny;
    x = -Bound; y = calculPolinom(coef, n, x);

    ctx.strokeStyle = GRAPH_COLOR;
    ctx.beginPath();

    for(let i = 1; i < canvas.width; i++)
    {
        nx = 2 * Bound * i / canvas.width - Bound;
        ny = calculPolinom(coef, n, nx);

        ctx.moveTo(toCanvasX(x), toCanvasY(y));
        ctx.lineTo(toCanvasX(nx), toCanvasY(ny));

        x = nx; y = ny;
    }
    ctx.stroke();
    mark_solutions();
    draw_point();
}



function onInput()
{
    const c = Number(coefContainer.querySelector('.coef-input').querySelector('input').value);
    if((isNaN(c) || c == 0) && coef.filter((c, i) => i < n && !isNaN(c) && c != 0).length > 0){
        coef.pop(); n--;
        coefContainer.querySelector('.coef-input').remove()
        while(coef[n] == 0) { 
            coefContainer.querySelector('.coef-input').remove();
            coef.pop(); 
            n--; 
        }
        sizeHeader.textContent = 'Grad: ' + n.toString();
        rangeInput.value = n;
        updateSlider();

        solve()
        update_point();
        draw_poly();
        return;
    }
    while(coef.length > 0) coef.pop();

    Array.from(coefContainer.querySelectorAll('.coef-input'))
        .forEach(coefInp => {
            const num = Number(coefInp.querySelector('input').value);
            const val = isNaN(num) ? 0 : num;
            coef.unshift(val);
        });
    while(rad.length > 0) rad.pop();
    solve();
    update_point();
    draw_poly();
}


function add_coef()
{
    const coefInp = document.createElement('div');
    coefInp.className = 'coef-input';
    const inp = document.createElement('input');
    const label = document.createElement('h1');
    coefInp.appendChild(label);
    coefInp.appendChild(inp);
    coefContainer.appendChild(coefInp);

    inp.addEventListener('input', onInput);
}

function get_num_coefs()
{
    return Array.from(coefContainer.querySelectorAll('.coef-input')).length;
}

function updateSlider() {
    const progress = ((rangeInput.value - rangeInput.min) /
        (rangeInput.max - rangeInput.min)) * 100;

    rangeInput.style.setProperty("--progress",`${progress}%`);
}

rangeInput.addEventListener('input', event => {
    sizeHeader.textContent = 'Grad: ' + rangeInput.value;
    n = Number(rangeInput.value);

    updateSlider();
    
    while(rad.length > 0) rad.pop();
    while(coef.length > 0) coef.pop();
    clear_graph();

    const num_coefs = get_num_coefs();

    if(num_coefs > n + 1) {
        while(get_num_coefs() > n + 1) {
            const coefInp = coefContainer.querySelector('.coef-input');
            coefInp.querySelector('input').removeEventListener('input', onInput);
            coefInp.remove();
        }
        Array.from(coefContainer.querySelectorAll('.coef-input'))
            .forEach(coefInp => {
                coefInp.querySelector('input').value = "";
        });
    }
    else if(num_coefs < n + 1) {
        Array.from(coefContainer.querySelectorAll('.coef-input'))
            .forEach(coefInp => {
                coefInp.querySelector('input').value = "";
        });
        for(let i = 0; i < n + 1 - num_coefs; i++)
            add_coef();
    }
    Array.from(coefContainer.querySelectorAll('.coef-input'))
        .forEach((coefInp, index) => {
            coefInp.querySelector('h1').innerHTML = `&#x1D465<sup>${n - index}</sup>`;
    });
});


function maxim(coef, n)
{
    let maxx = Math.abs(coef[0]);
    for(let i = 1;i < n; i++)
        if(Math.abs(coef[i]) > maxx)maxx = Math.abs(coef[i]);
    return maxx;
}


function calculPolinom(coef, n, x){
    let rez = coef[n];
    for(let i = n - 1; i >= 0; i--){
        rez = rez * x + coef[i];
    }
    return rez;
}


function gasirePunct(raza, n, coef){
    for(let i = raza * (-1); i <= raza; i = i + 0.01){
        const k = calculPolinom(coef, n, i);
        const z = calculPolinom(coef, n, i + 0.01);
        if(k * z <= 0) return i;
    }
    return 1e9;
}


function derivataPolinom(coef, n, x){
    let rez = n * coef[n];
    for(let i = n - 1; i >= 1; i--){
        rez = rez * x + i * coef[i];
    }
    return rez;
}


function horner(coef, n, r)
{
    const temp = new Array(50);
    temp[n-1] = coef[n];

    for(let i = n - 1; i >= 1; i--){
        temp[i-1] = coef[i] + temp[i] * r;
    }
    for(let i = 0; i < n; i++){
        coef[i] = temp[i];
    }
}


function solve()
{
    while(rad.length > 0) rad.pop();
    if(coef.length == 0 || coef.filter((e, index) => index > 0 && e == 0).length == n)
        return;

    let raza, coef_max, xvechi, xnou = 0, cn = n, i, norm, deriv;
    const c_coef = new Array(50);

    for(i = n; i >= 0; i--) c_coef[i] = coef[i];
    
    while(n > 0) {
        coef_max = maxim(coef, n);
        raza = 1 + (coef_max / Math.abs(coef[n]));
        const punct = gasirePunct(raza, n, coef);
        if(punct == 1e9) break;
        xvechi = punct;
        let iter = 0;

        while(Math.abs(calculPolinom(coef, n, xvechi)) > 1e-6 && iter < 1000){

            norm = calculPolinom(coef, n, xvechi);
            deriv = derivataPolinom(coef, n, xvechi);

            if (Math.abs(deriv) < 1e-12) deriv = 1e-12;


            xnou = xvechi - (norm/deriv);

            if(Math.abs(xnou - Math.round(xnou)) < 1e-2)
                xnou = Math.round(xnou);

            if(Math.abs(xnou - xvechi) < 1e-12)
                break;

            xvechi = xnou;
            iter++;
        }

        let ok = 1;
        for(let i = 0; i < rad.length && ok; i++)
            if(Math.abs(rad[i].val - xvechi) < 1e-2) {
                rad[i].ord++;
                ok = 0;
            }

        if(ok){ rad.push({ val: xvechi, ord: 1, id: `sol#${solutionId}`}); solutionId++;}
        
        horner(coef, n, xvechi);
        n--;
    }

    for(let i = 0; i < rad.length; i++) {
        if(Math.abs(calculPolinom(c_coef, cn, rad[i].val)) > 1e-4) {
            for(let j = i + 1; j < rad.length; j++)
                rad[j - 1] = rad[j];
            i--;
        }
    }
    n = cn;
    for(i = n; i >= 0; i--) coef[i] = c_coef[i];

    mark_solutions();
}


function check_solutions() {
    if(solOpen) return;
    for(let i = 0; i < rad.length; i++){
        const canvasX = toCanvasX(rad[i].val);
        const canvasY = toCanvasY(0);
        const dx = (mouseX - canvasX);
        const dy = (mouseY - canvasY);

        if(Math.sqrt(dx * dx + dy * dy) < 80 / Bound) {
            if(document.getElementById(rad[i].id) == null) {
                const header = document.createElement('h2');
                header.id = rad[i].id;
                header.className = 'solution-header';
                header.textContent = '(' + convert_sol(rad[i].val) + ', 0)';
                header.style.top = canvasY + canvas.offsetTop + 'px';
                header.style.left = canvasX + canvas.offsetLeft + 'px';
                header.style.translate = `-50% calc(-100% - ${30 * Math.sqrt(20 / Bound)}px)`;
                header.style.transform = `scale(${Math.sqrt(20 / Bound)})`;
                document.body.appendChild(header);
            }
        }
        else if(document.getElementById(rad[i].id) != null)
            document.getElementById(rad[i].id).remove();
    }
}

canvas.addEventListener('mousemove', (event) => {
    mouseX = event.clientX - canvas.offsetLeft;
    mouseY = event.clientY - canvas.offsetTop;
    check_solutions();
});


for(let i = 0; i < n + 1; i++)
    add_coef();
Array.from(coefContainer.querySelectorAll('.coef-input'))
    .forEach((coefInp, index) => {
        coefInp.querySelector('h1').innerHTML = `&#x1D465;<sup>${n - index}</sup>`;
        if(coef[n - index] != undefined)
            coefInp.querySelector('input').value = coef[n - index];
});
solve(); draw_poly();


window.addEventListener('beforeunload', () => {
    console.log(coef);
    localStorage.setItem('polinom', JSON.stringify({
        n: n,
        coef: coef
    }));
});