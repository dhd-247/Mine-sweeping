// 1.点击开始游戏 -> 动态生成100个小格 -> 100个div
// 2.leftClick： 没有雷 -> 显示数字 (代表以当前小格为中心，周围8个格的雷数)
//               有雷：game over
//    扩散：当前周围8个格没有雷
// 3.rightClick：有标记，取消标记；
//               没有标记并且没有数字，进行标记
//    已经出现数字，无效果
//    标记是否正确：10都正确标记，提示成功

var startBtn = document.getElementById('btn');
var box = document.getElementById('box');
var flagBox = document.getElementById('flagBox');
var alertBox = document.getElementById('alertBox');
var alertImg = document.getElementById('alertImg');
var closeBtn = document.getElementById('close');
var score = document.getElementById('score');
var minesNum; // 雷的数量 
var mineOver; // 已经被标记雷的数量
var block;
var mineMap = [];
var startGameBool = true; // 加锁，点一次startgame之后不能再点

bindEvent();
function bindEvent() {
    startBtn.onclick = function () {
        if (startGameBool) {
            box.style.display = 'block';
            flagBox.style.display = 'block';
            init();
            startGameBool = false;
        }
        
    }

    // 取消棋盘上的鼠标右键默认事件
    box.oncontextmenu = function () {
        return false;
    }
    box.onmousedown = function (e) { // 鼠标落下事件
        var event = e.target; // 点的是哪个小格
        if (e.which == 1) { // 点的是左键
            leftClick(event);
        }else if (e.which == 3) { // 点的是右键
            rightClick(event);
        }
    }
    // 点击叉号，GAMEOVER图片 和 棋盘都消失
    closeBtn.onclick = function () {
        alertBox.style.display = 'none';
        flagBox.style.display = 'none'; 
        box.style.display = 'none'; // 棋盘
        box.innerHTML = ''; // HTML内容置空
        startGameBool = true;
    }
}

function init() {
    minesNum = 10;
    mineOver = 10;
    score.innerHTML = mineOver;    
    for (var i = 0; i < 10; i++) {
        for (var j = 0; j < 10; j++) {
            var con = document.createElement('div');
            con.classList.add('block'); // 设置同样的类名，规定最开始的样式
            con.setAttribute('id', i + '-' + j); // 设置自己单独的id，为第几行第几列
            box.appendChild(con);
            mineMap.push({ mine: 0 });
        }
    }
    block = document.getElementsByClassName('block');
    while (minesNum) {
        var mineIndex = Math.floor(Math.random() * 100); // 随机标记1个雷出现的位置
        if (mineMap[mineIndex].mine === 0) {
            mineMap[mineIndex].mine = 1; // 标记为1，避免雷在一个位置重复出现
            block[mineIndex].classList.add('isLei');
            minesNum--; // 总雷数-1
        }
    }


}

function leftClick (dom) {
    // 如果插旗了，不能再点
    if (dom.classList.contains('flag')) {
        return;
    }
    var isLei = document.getElementsByClassName('isLei'); 
    // dom存在 并且 dom的所有class名里 包含有 isLei存在，说明点到了雷
    if (dom && dom.classList.contains('isLei')) {
        console.log('game over');
        for (var i = 0; i < isLei.length; i++) {
            isLei[i].classList.add('show');// 让他们显示出了
            // return;
        }

        // 弹窗 游戏结束
        setTimeout(function (){
            alertBox.style.display = 'block';
            alertImg.style.backgroundImage = 'url("./img/gameover.jpg")';
        }, 800);
    }else { // 如果点到的不是雷
        var n = 0; // 记旁边的雷的总数
        // 100个格子每个有各自以行列标记的id，eg：0-0,0-1
        // dom.getAttribute('id')是字符串，
        // 加上.split('-')拆分，得到对应的 X，Y
        var posArr = dom && dom.getAttribute('id').split('-');
        //        容错处理  存在 -> 取索引值
        var posX = posArr && +posArr[0]; // 隐式类型转换 
        var posY = posArr && +posArr[1];
        dom && dom.classList.add('num'); // dom存在 && 加上属性名


        // i-1,j-1     i-1,j     i-1,j+1
        // i,j-1       i,j       i,j+1
        // i+1,j-1     i+1,j     i+1,j+1
        for (var i = posX - 1; i <= posX + 1; i++) {
            for (var j = posY - 1; j <= posY + 1; j++) {
                var aroundBox = document.getElementById(i + '-' + j); // 周围的id
                if (aroundBox && aroundBox.classList.contains('isLei')) { // 周围存在雷
                    n++; // 雷数+1
                }
            }
        }
        dom && (dom.innerHTML = n); // 当前的数字(雷的个数)插入到相应位置
        if (n == 0) { // 周围没有雷：扩散
            
            dom && (dom.innerHTML = ''); // 0不显示
            
            // 判断周围 为0的8个
            for (var i = posX - 1; i <= posX + 1; i++) {
                for (var j = posY - 1; j <= posY + 1; j++) {
                    var nearBox = document.getElementById(i + '-' + j); // 周围的id
                    if (nearBox && nearBox.length != 0) { // nearBox存在 && 长度不为0
                        // 因为周围8个格子 会有 重叠， 检验完的进行标记
                        if ( !nearBox.classList.contains('checked')) { // 如果 没有被检查过
                            nearBox.classList.add('checked'); // 标记已检查
                            leftClick(nearBox); // 递归，设置当前点为被点击的点
                            //                    n != 0 时结束
                        }
                        
                    }
                }
            }
        }
        
    }
}

function rightClick (dom) {
    // 如果当前格子已经显示数字，则不能进行插旗
    if (dom.classList.contains('num')) {
        return;
    }
    // 插旗之后可以右键取消
    // toggle: 没有这个class就加上，有这个class可以减掉
    dom.classList.toggle('flag');
    
    // 如果当前下面是雷 && 已经插旗了
    if (dom.classList.contains('isLei') && dom.classList.contains('flag') ) {
        mineOver--; // 剩余雷数 -1
    }
    // 如果当前下面是雷 && 没插旗
    if (dom.classList.contains('isLei') && !dom.classList.contains('flag') ) {
        mineOver++; // 剩余雷数 +1
    }

    // 剩余雷数
    score.innerHTML = mineOver;
    if (mineOver == 0) {
        alertBox.style.display = 'block';
        alertImg.style.backgroundImage = 'url("./img/win.jpg")';
    }
}