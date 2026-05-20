const display = document.getElementById("display");
const max_length = 18;

const prev_display_buffer = [];
const next_display_buffer = [];
const max_buffer_len = 5;

document.querySelector('.equal').addEventListener('click', () => {
    let prev_display = display.value;
    display.value = calculate(display.value).toString();
    if(display.value != prev_display) add_to_history();
});

const openBracketBtn = document.getElementById('open-bracket-btn');
openBracketBtn.textContent = '(';
openBracketBtn.addEventListener('click', () => {
    appendStringToDisplay('(');
});

const closeBracketBtn = document.getElementById('close-bracket-btn');
closeBracketBtn.textContent = ')';
closeBracketBtn.addEventListener('click', () => {
    appendStringToDisplay(')');
});

function mouse_down(elem, event)
{
    const offset_x = elem.offsetLeft - event.clientX;
    const offset_y = elem.offsetTop - event.clientY;

    function mouse_move(event)
    {
        elem.style.left = event.clientX + offset_x + 'px';
        elem.style.top = event.clientY + offset_y + 'px';
    }

    function mouse_up()
    {
        document.removeEventListener('mousemove', mouse_move);
        document.removeEventListener('mouseup', mouse_up);
    }

    document.addEventListener("mousemove", mouse_move);
    document.addEventListener("mouseup", mouse_up);
}


function close_table(table){
    table.style.opacity = '0';
    table.style.pointerEvents = "none";
    table.style.animation = "fade-out 0.1s linear";

    setTimeout(() => {
        table.style.display = 'none';
        table.style.pointerEvents = 'all';
        table.style.top = '50%';
        table.style.left = '50%'
    }, 100);
}


function close_panels() {
    Array.from(document.querySelectorAll('.panel')).forEach(panel => {
        if(panel.style.display != 'none') {
            close_table(panel);
            return;
        }
    });
}


const calculator = document.getElementById("calculator");
const function_table = document.getElementById("func-table");
function_table.style.display = "none";
const func_btn = document.getElementById("func-btn");
func_btn.addEventListener("click", event =>{
    if(function_table.style.display == 'grid')
        return;

    close_panels();
    
    function_table.style.opacity = '1';
    function_table.style.display = "grid";
    function_table.style.animation = "fade-in 0.1s linear";
    function_table.addEventListener('mousedown', e => mouse_down(function_table, e));
});

const trig_table = document.getElementById("trig-table");
trig_table.style.display = "none";
const trig_btn = document.getElementById("trig-btn");
trig_btn.addEventListener("click", event =>{
    if(trig_table.style.display == 'grid')
        return;

    close_panels();
    
    trig_table.style.opacity = '1';
    trig_table.style.display = "grid";
    trig_table.style.animation = "fade-in 0.1s linear";
    trig_table.addEventListener('mousedown', e => mouse_down(trig_table, e));
});

const close_table_btn = document.getElementById("close-table-btn");
close_table_btn.addEventListener("click", close_panels);


const display_history = [];
const max_history_len = 5;

const history_tab = document.getElementById("history-tab");
history_tab.style.display = "none";

function open_history()
{
    calculator.style.display = "none";
    history_tab.style.display = "block";
}

function close_history()
{
    calculator.style.display = "block";
    history_tab.style.display = "none";
}


function create_hist_btn()
{
    let hist_btn = document.createElement('button');
    hist_btn.className = 'hist-grid-btn';
    history_tab.querySelectorAll('div')[1].appendChild(hist_btn);

    hist_btn.addEventListener("click", event => {
        if(hist_btn.textContent.length > 0)
        {
            display.value = hist_btn.textContent;
            close_history();
        }
    });
}

function add_to_history()
{
    const lastChar = display.value.charCodeAt(display.value.length - 1);
    if(lastChar < 48 || lastChar > 57) return;

    if(display_history.length == max_history_len) {
        display_history.pop();
        const histBtns = Array.from(document.querySelectorAll('.hist-grid-btn'));
        histBtns[histBtns.length - 1].remove();
    }

    create_hist_btn(display.value);

    if(display_history.length == 0)
        display_history.push(display.value);
    else {
        display_history.push(display_history[display_history.length - 1]);
        for(let i = display_history.length - 2; i >= 0; i--)
            display_history[i + 1] = display_history[i];
        display_history[0] = display.value;
    }

    Array.from(document.querySelectorAll('.hist-grid-btn')).forEach((btn, i) => {
        btn.textContent = display_history[i];
    });
}



function clear_array(array)
{
    while(array.length > 0)
        array.pop();
}

function add_undo_action()
{
    if(prev_display_buffer.length == max_buffer_len)
    {
        for(let i = 1; i < prev_display_buffer.length; i++)
            prev_display_buffer[i - 1] = prev_display_buffer[i];
        prev_display_buffer.pop();
    }
    prev_display_buffer.push(display.value);
    
}

function add_redo_action()
{
    if(next_display_buffer.length == max_buffer_len)
    {
        for(let i = 1; i < next_display_buffer.length; i++)
            next_display_buffer[i-1] = next_display_buffer[i];
        next_display_buffer.pop();
    }
    next_display_buffer.push(display.value);
}

function appendToDisplay(input)
{
    if(display.value.length == max_length)
        return;

    clear_array(next_display_buffer);
    add_undo_action();
    
    if(display.value == "ERROR" || display.value == "Invalid Input")
        clearDisplay();
    display.value += input;
}

function clearDisplay()
{
    clear_array(next_display_buffer);

    add_undo_action();
    display.value = "";
}

function deleteChar()
{
    if(display.value.length == 0) return;

    clear_array(next_display_buffer);
    add_undo_action();

    let s = "";
    for(let i = 0; i < display.value.length - 1; i++)
        s += display.value[i];
    display.value = s;
}

function undoAction()
{
    if(prev_display_buffer.length == 0) return;

    add_redo_action();

    display.value = prev_display_buffer[prev_display_buffer.length - 1];
    prev_display_buffer.pop();
}

function redoAction()
{
    if(next_display_buffer.length == 0) return;

    add_undo_action();

    display.value = next_display_buffer[next_display_buffer.length - 1];
    next_display_buffer.pop();
}

const operators = ['+', '-', '*', '/']
function is_operator(input)
{
    for(let i = 0; i < operators.length; i++)
        if(operators[i] == input) return true;
    return false;
}


function valid_brackets(s)
{
    const stack = [];
    for(let i = 0; i < s.length; i++) {
        if(s[i] == '(') stack.push('(');
        else if(s[i] == ')')
        {
            if(stack.length == 0) return false;
            stack.pop();
        }
    }
    return stack.length == 0;
}

function valid_decimals(s) {
    const poz = [];
    for(let i = 0; i < s.length; i++)
        if(s[i] == '.') poz.push(i);

    for(let i = 0; i < poz.length - 1; i++) {
        if(poz[i + 1] - poz[i] <= 2) 
            return false;
        if(s[poz[i + 1] - 1] > '9' || s[poz[i + 1] - 1] < '0')
            return false;

        let found = false;
        for(let j = poz[i] + 1; j <= poz[i + 1] - 2 && !found; j++)
            if(is_operator(s[j]))
                found = true;
        if(!found) 
            return false;
    }
    return true;
}

function calculate(s)
{
    if(is_operator(s[s.length - 1]) || !valid_brackets(s) || !valid_decimals(s))
        return "ERROR";

    for(let i = 0; i < s.length; i++)
        if(s[i] == '(')
        {
            const stack = [], start = i + 1;
            let end = i + 1;
            stack.push('(');

            while(stack.length > 0)
            {
                if(s[end] == '(') stack.push('(');
                else if(s[end] == ')') stack.pop();
                end++;
            }
            end -= 2;
            const new_string = (i >= 1 ? s.slice(0, i) : "") + 
                calculate(s.slice(start, end + 1)).toString() + s.slice(end + 2);
            return calculate(new_string);
        }
    
    s += " ";
    let sum = 0;
    let index = 0;
    let sign = 1;
    let num = 0;
    while(index < s.length)
    {
        if('0' <= s[index] && s[index] <= '9')
        {
            num = 0;
            while('0' <= s[index] && s[index] <= '9')
            {  
                num = num * 10 + (s[index] - '0');
                index++;
            }
        }
        
        if(is_operator(s[index]))
        {
            if(index == s.length - 1) return "ERROR";
            if(is_operator(s[index + 1]))
                if(index + 2 >= s.length || s[index + 2] < '0' || s[index + 2] > '9')
                    return "ERROR";
        }
        
        if(s[index] == '-'){
            sum += num * sign;
            sign = -1;
        }
        else if(s[index] == '+'){
            sum += num * sign;
            sign = 1;
        }
        else if (s[index] == '*')
        {
            index++;
            let new_num = 0;
            while('0' <= s[index] && s[index] <= '9')
            {  
                new_num = new_num * 10 + (s[index] - '0');
                index++;
            }
            if(s[index] == '.')
            {
                if(index >= 1)
                {
                    if(s[index - 1] < '0' || s[index - 1] > '9'){
                            new_num = 0;
                    }
                }
                else new_num = 0;
        
                index++;
                let decimals = 0;
                let p = 10;
                while('0' <= s[index] && s[index] <= '9')
                {  
                    decimals += (s[index] - '0') / p;
                    p *= 10;
                    index++;
                }
                new_num += decimals;
            }
            index--;
            num = num * new_num;
        }
        else if (s[index] == '/')
        {
            index++;
            let new_num = 0;
            while('0' <= s[index] && s[index] <= '9')
            {  
                new_num = new_num * 10 + (s[index] - '0');
                index++;
            }
            if(s[index] == '.')
            {
                if(index >= 1)
                {
                    if(s[index - 1] < '0' || s[index - 1] > '9'){
                        new_num = 0;
                    }
                }
                else new_num = 0;
            
                index++;
                let decimals = 0;
                let p = 10;
                while('0' <= s[index] && s[index] <= '9')
                {  
                    decimals += (s[index] - '0') / p;
                    p *= 10;
                    index++;
                }
                new_num += decimals;
            }
            index--;
            if (new_num == 0){
                return "ERROR";
            }
            num = num/new_num;
        }
        else if(s[index] == '.')
        {
            if(index >= 1)
            {
                if(s[index - 1] < '0' || s[index - 1] > '9'){
                    num = 0;
                }
            }
            else num = 0;

            index++;
            let decimals = 0;
            let p = 10;
            while('0' <= s[index] && s[index] <= '9')
            {  
                decimals += (s[index] - '0') / p;
                p *= 10;
                index++;
            }
            num += decimals;
            index--;
        }
        else if(index == s.length - 1)
        {
            sum += sign * num;
        }

        index++;
    }
    return Math.round(sum * 10000) / 10000;
}

function convert_display()
{
    let prev_display = display.value;
    display.value = calculate(display.value).toString();
    if(display.value != prev_display) add_to_history();

    let start_poz = 0;
    let sign = 1;
    if(display.value[0] == '-')
    {
        sign = -1;
        start_poz = 1;
    }
    let base = 0;
    var index;
    for(let i = start_poz; i < display.value.length; i++)
    {
        if(display.value[i] == '.'){
            index = i + 1;
            break;
        }
        base = base * 10 + (display.value[i] - '0');
    }

    pow = 10;
    for(let i = index; i < display.value.length; i++)
    {
        base += (display.value[i] - '0') / pow;
        pow *= 10;
    }
    return sign * Math.round(10000 * base) / 10000;
}


function inverse_func(x, st, dr, func, growing)
{
    let p = Math.floor(10000 * (st + dr) / 2) / 10000;
    
    if(st >= dr)
    {
        display.value = p.toString();
        return;
    }
    else{
        const val = func(p);
        if(Math.abs(x - val) < 1 / 10000) 
            display.value = p.toString();

        else if((x - val) * (growing ? 1 : -1) >= 1/10000) 
            inverse_func(x, p + 1/10000, dr, func, growing);

        else inverse_func(x, st, p - 1/10000, func, growing);
    }
}

function raise_to_power(power)
{
    close_table(function_table);

    add_undo_action();
    let base = convert_display();

    if(power == -1)
    {
        if(base == 0) display.value = "Invalid Input";
        else{
            display.value = (Math.floor(10000/base) / 10000).toString();
            add_to_history();
        }
        return;
    }
    let p = 1;
    for(let i = 0; i < Math.round(power); i++)
        p *= base;
    p = Math.floor(p * 10000) / 10000;
    display.value = p.toString();

    add_to_history();
}

function Power(x, ord)
{
    let p = 1;
    for(let i = 0; i < ord; i++)
        p *= x;
    return p;
}


function root(ord)
{
    close_table(function_table);
    add_undo_action();

    let x = convert_display();
    if(ord % 2 == 0 && x < 0)
    {
        display.value = "Invalid Input";
        return;
    }
    const powerFunc = (x) => Power(x, ord);
    const st =  -Math.abs(Power(x, ord)), dr = Math.abs(Power(x, ord));
    inverse_func(x, st, dr, powerFunc, true);

    add_to_history();
}


function log(base)
{
    close_table(function_table);
    add_undo_action();

    let x = convert_display();
    if(x <= 0){
        display.value = "Invalid Input";
        return;
    }
    const expFunc = (x) => Math.pow(base, x);
    inverse_func(x, -x - 1, x + 1, expFunc, true);

    add_to_history();
}


function exponentiate(base)
{
    close_table(function_table);
    add_undo_action();

    let x = convert_display();
    display.value = (Math.floor(Math.pow(base, x) * 10000) / 10000).toString();

    add_to_history();
}

function appendStringToDisplay(string)
{
    add_undo_action();
    if(display.value.length + string.length > max_length)
        return;
    display.value += string;
}

function absoluteValue()
{
    close_table(function_table);
    add_undo_action();
    let x = convert_display();
    display.value = x.toString();
    if(x < 0){
        display.value = (-x).toString();
    }

    add_to_history();
}

function factorial() 
{
    close_table(function_table);
    add_undo_action();
    let n = convert_display();
    if(n != Math.floor(n) || n < 0)
    {
        display.value = "Invalid Input";
        return;
    }
    if(n == 0)
    {
        display.value = "0";
        return;
    }
    let prod = 1;
    for(let i = 1; i <= n;i++)
        prod *= i;
    display.value = prod.toString();

    add_to_history();
}


function Sin() {
    close_table(trig_table);
    add_undo_action();
    let x = convert_display();
    display.value = (Math.round(10000 * Math.sin(x))/ 10000).toString();

    add_to_history();
}

function Cos() {
    close_table(trig_table);
    add_undo_action();
    let x = convert_display();
    display.value = (Math.round(10000 * Math.cos(x))/ 10000).toString();

    add_to_history();
}

function Tan() {
    close_table(trig_table);
    add_undo_action();

    let x = convert_display();
    if(2 * x / 3.1415 - Math.round(2 * x / 3.1415) < 1/10000)
    {
        if(Math.round(2 * x / 3.1415) % 2 == 1)
        {
            display.value = "Invalid Input";
            return;
        }
    }
    display.value = (Math.round(10000 * Math.sin(x) / Math.cos(x))/ 10000).toString();

    add_to_history();
}

function Cot() {
    close_table(trig_table);
    add_undo_action();

    let x = convert_display();
    if(Math.sin(x) == 0)
    {
        
        display.value = "Invalid Input";
        return;  
    }
    display.value = (Math.round(10000 * 1/Math.tan(x)) / 10000).toString();

    add_to_history();
}


function Arcsin() {
    close_table(trig_table);
    add_undo_action();
    let x = convert_display();
    if(x > 1 || x < -1)
    {
        display.value = "Invalid Input";
        return;
    }
    const sinFunc = (x) => Math.sin(x);
    inverse_func(x, -Math.PI/2, Math.PI/2, sinFunc, true);

    add_to_history();
}


function Arccos() {
    close_table(trig_table);
    add_undo_action();
    let x = convert_display();
    if(x > 1 || x < -1)
    {
        display.value = "Invalid Input";
        return;
    }
    const cosFunc = (x) => Math.cos(x);
    inverse_func(x, -0.1, Math.PI, cosFunc, false);

    add_to_history();
}

function Sec() {
    close_table(trig_table);
    add_undo_action();
    let x = convert_display();
    if(Math.cos(x) < 1/10000 || Math.cos(x) > -1/10000)
    {
        display.value = "Invalid Input";
        return;
    }
    display.value = (Math.round(10000 / Math.cos(x)) / 10000).toString();

    add_to_history();
}

function Cosec() {
    close_table(trig_table);
    add_undo_action();
    let x = convert_display();
    if(Math.sin(x) < 1/10000 || Math.sin(x) > -1/10000)
    {
        display.value = "Invalid Input";
        return;
    }
    display.value = (Math.round(10000 / Math.sin(x)) / 10000).toString();

    add_to_history();
}

function ConvertRad() {
    close_table(trig_table);
    add_undo_action();
    let angle = convert_display();
    angle = angle * Math.PI / 180
    display.value = (Math.round(10000 * angle) / 10000).toString();

    add_to_history();
}

function ConvertDeg() {
    close_table(trig_table);
    add_undo_action();
    let angle = convert_display();
    angle = angle * 180 / Math.PI;
    display.value = (Math.round(angle)).toString();

    add_to_history();
}


function Arctan() {
    close_table(trig_table);
    add_undo_action();

    const tanFunc = (x) => Math.tan(x);
    inverse_func(convert_display(), -Math.PI/2, Math.PI/2, tanFunc, true);

    add_to_history();
}


function Arccot() {
    close_table(trig_table);
    add_undo_action();

    const x = convert_display();

    if(Math.tan(x) == 0) {
        display.value = (Math.PI / 2).toString();
        return;
    }
    const cotFunc = (x) => 1 / Math.tan(x);
    inverse_func(x, 0, Math.PI, cotFunc, false);

    add_to_history();
}


function clear_history() 
{
    clear_array(display_history);
    while(document.querySelector('.hist-grid-btn') != null)
        document.querySelector('.hist-grid-btn').remove();
}

function delete_last_from_history() 
{
    if(display_history.length == 0) return;

    for(let i = 1; i < display_history.length; i++)
        display_history[i - 1] = display_history[i];
    display_history.pop();

    const histBtns = Array.from(document.querySelectorAll('.hist-grid-btn'));
    histBtns[histBtns.length - 1].remove();

    Array.from(document.querySelectorAll('.hist-grid-btn')).forEach((btn, i) => {
        btn.textContent = display_history[i];
    });
}
