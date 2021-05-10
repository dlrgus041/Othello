/* 변수 */

// 누구의 차례인지 알려주는 텍스트 상자
// 그림 + 타이머 형태의 가독성이 높은 요소로 대체될 예정
const status = document.querySelector('#status').lastElementChild;

// 잘못된 칸에 놓았으면 true, 아니면 false
// status가 대체되면 삭제할 예정
let wrong = false;

// 게임보드
const board = document.querySelector('#board');

// arr[i][j] : i열 j행 칸에 돌이 놓여있지 않다면 0,
// 검은색 돌이 놓여있다면 1, 흰색 돌이 놓여있다면 2.
const arr = Array.from(Array(8), () => Array(8).fill(0));

// 색깔별 현재 돌의 개수
let black = 0;
let white = 0;

// true : 검정색, false : 흰색
let turn = true;

// 8방향 탐색(시계방향 순서)
const dir = [
    {i: -1, j: 0},  // 북
    {i: -1, j: 1},  // 북동
    {i: 0, j: 1},   // 동
    {i: 1, j: 1},   // 남동
    {i: 1, j: 0},   // 남
    {i: 1, j: -1},  // 남서
    {i: 0, j: -1},  // 서
    {i: -1, j: -1}, // 북서
];

/* 함수 */

// 턴 바꾸기
function change() {
    turn = !turn;
    wrong = false;
    status.innerText = `${turn ? '검은' : '흰'}색 돌 차례입니다.`
}

// 해당 칸의 위치를 객체로 반환
function coor(e) { 
    return {
        row: Number(e.target.dataset.row),
        col: Number(e.target.dataset.col)
    }
}

// row행 col열 타일
// flag : true = 돌 놓기, false = 뒤집기(기본값)
// color : 0 = turn에 따라서 선택(기본값), 1 = 검정색, 2 = 흰색
function place({row, col}, flag = false, color = 0) {
    const stone = board.children[8 * row + col].firstElementChild;
    if (flag) {
        if (color) {
            stone.classList.add((color < 2) ? 'black' : 'white');
            (color < 2) ? black++ : white++;
            arr[row][col] = color;
        } else {
            stone.classList.add(turn ? 'black' : 'white');
            turn ? black++ : white++;
            arr[row][col] = (turn ? 1 : 2);
        }
    } else {
        stone.classList.toggle('black');
        stone.classList.toggle('white');
        arr[row][col] = 3 - arr[row][col];

        if (turn) {
            black++;
            white--;
        } else {
            black--;
            white++;
        }
    }
}

// arr[i][j] 반환
function isStone(e) {
    let {row, col} = coor(e);
    return arr[row][col];
}

// flag = true : 좌표끼리 더하기(기본값), false : 좌표끼리 삐기
function plus(pos, inc, flag = true) {
    if (flag) {
        pos.row += inc.i;
        pos.col += inc.j;
    } else {
        pos.row -= inc.i;
        pos.col -= inc.j;
    }
}

// 잘못된 좌표이면 false를 반환
function isRightPos({row, col}) {
    if (row < 0 || row > 7) return false;
    if (col < 0 || col > 7) return false;
    return true;
}

// 돌을 놓은 후(마우스 클릭 후) 상대 돌 뒤집기 후 턴 넘김
function action(e) {
    
    let vaild = false;
    const origin = coor(e);

    for (let i = 0; i < 8; i++) {

        let noStone = false;
        let moreThanZero = false;
        let pos = { ...origin };

        do {
            plus(pos, dir[i]);
            if (!isRightPos(pos) || !arr[pos.row][pos.col]) {
                noStone = true;
                break;
            }

            if (arr[pos.row][pos.col] == (turn ? 1 : 2)) break;

            moreThanZero = true;

        } while (true);

        if (noStone || !moreThanZero) continue;

        vaild = true;

        do {
            plus(pos, dir[i], false);

            if (pos.row == origin.row && pos.col == origin.col) break;
            
            place(pos);
        
        } while (true);
    }

    if (vaild) {

        place(origin, true);

        if (black * white == 0) {
            alert(black ? '검은색 돌이 승리했습니다!' : '흰색 돌이 승리했습니다!');
            alert(`한 번 더 하고싶다면 'F5' 또는 '새로고침'을 누르세요.`);
        } else if (black + white == 64) {
            alert(`검은색 돌 ${black}개, 흰색 돌 ${white}개.\n${(bleck > white) ? '검은' : '흰'}색 돌이 승리했습니다!`);
            alert(`한 번 더 하고싶다면 'F5' 또는 '새로고침'을 누르세요.`);
        } else change();

    } else if (!wrong) {
        status.innerText += `\n\n해당 칸에 놓을 수 없습니다.`;
        wrong = true;
    }
}

/* 핸들러 */

// 마우스를 올리면 힌트가 보임
function hover(e) {
    if (isStone(e)) return;
    e.target.classList.toggle('grey');
}

// 마우스 클릭
function click(e) {
    if (isStone(e)) return;
    action(e);
}

/* 실행 */
// 게임 초기화
for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
        
        const tile = document.createElement('div');
        tile.classList.add('tile');
        tile.classList.add(((i + j) & 1) ? 'brown' : 'apricot');

        const circle = document.createElement('div');
        circle.classList.add('circle');
        circle.dataset.row = i;
        circle.dataset.col = j;

        circle.addEventListener('mouseover', hover);
        circle.addEventListener('mouseout', hover);
        circle.addEventListener('mousedown', click);

        tile.append(circle);
        board.append(tile);
    }
}

place({row: 3, col: 3}, true, 1);
place({row: 3, col: 4}, true, 2);
place({row: 4, col: 3}, true, 2);
place({row: 4, col: 4}, true, 1);

status.innerText = `검은색 돌 차례입니다.`