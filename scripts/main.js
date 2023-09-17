const RADIUS = 30;
const FONT_SZ = 32;
const UNVIS = 0, ON_STACK = 1, VIS = 2, CUR = 3;
const RED = "#eb6f92", BLUE = "#31748f", GREEN = "#9ccfd8", YELLOW = "#f6c177"; 
const BKG = "#fffaf3";
let nodes = [], edges = [], vis = [], adj = [];
let states = [];
let edit_mode = true, state_id = 0;

function changeMode() {
    states = [];
    edit_mode = document.getElementById("edit-mode").checked;
}

function redraw() {
    const canvas = document.getElementById("canvas-graph");
    if (canvas.getContext) {
        const c = canvas.getContext("2d");
        c.font = FONT_SZ.toString() + "px sans";

        c.fillStyle = BKG;
        c.fillRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < edges.length; i++) {
            c.beginPath();
            c.moveTo(nodes[edges[i][0]][0], nodes[edges[i][0]][1]);
            c.lineTo(nodes[edges[i][1]][0], nodes[edges[i][1]][1]);
            c.stroke();
        }
        for (let i = 0; i < nodes.length; i++) {
            c.beginPath();
            c.arc(nodes[i][0], nodes[i][1], RADIUS, 0, 2 * Math.PI);
            if (states.length == 0 || states[state_id][i] == UNVIS) {
                c.fillStyle = RED;
            } else if (states[state_id][i] == ON_STACK) {
                c.fillStyle = BLUE;
            } else if (states[state_id][i] == VIS) {
                c.fillStyle = GREEN;
            } else {
                c.fillStyle = YELLOW;
            }
            c.fill();
            c.stroke();

            c.fillStyle = "black";
            c.textAlign = "center";
            // c.fillText((i + 1).toString(), nodes[i][0] - FONT_SZ / 3, nodes[i][1] + FONT_SZ / 3);
            c.fillText((i + 1).toString(), nodes[i][0], nodes[i][1] + FONT_SZ / 3);
        }
    }
}

function getEdges() {
    let n = nodes.length;
    adj = [];
    for (let i = 0; i < n; i++) {
        adj.push([]);
    }
    
    edges = [];
    let lines = document.getElementById("edges-input").value.split("\n");
    lines.forEach((line) => {
        if (line.length != 0) {
            let edge = line.trim().split(" ");
            let u = parseInt(edge[0]) - 1, v = parseInt(edge[1]) - 1;
            edges.push([u, v]);
            adj[u].push(v);
            adj[v].push(u);
        }
    });

    states = [];
    let base_state = [];
    for (let i = 0; i < n; i++) {
        base_state.push(UNVIS);
    }
    states.push(base_state);
    state_id = 0;

    redraw();
}

function bfs(v) {
    getEdges();
    vis = [];
    let first_state = [];
    for (let i = 0; i < nodes.length; i++) {
        vis.push(false);
        first_state.push(i == v ? ON_STACK : UNVIS);
    }
    states.push(first_state);

    let q = [v];
    let in_queue = new Set();
    in_queue.add(v);
    while (q.length > 0) {
        v = q.shift();
        in_queue.delete(v);
        vis[v] = true;

        adj[v].forEach((u) => {
            if (!vis[u]) {
                q.push(u);
                in_queue.add(u);
            }
        });

        let state = [];
        for (let i = 0; i < nodes.length; i++) {
            if (i == v) {
                state.push(CUR);
            } else if (in_queue.has(i)) {
                state.push(ON_STACK);
            } else if (vis[i]) {
                state.push(VIS);
            } else {
                state.push(UNVIS);
            }
        }
        states.push(state);
    }
    states.push(new Array(nodes.length).fill(VIS));
}

let on_stack = new Set();
function dfs_rec(v) {
    vis[v] = true;
    on_stack.add(v);

    let state = [];
    for (let i = 0; i < nodes.length; i++) {
        if (i == v) {
            state.push(CUR);
        } else if (on_stack.has(i)) {
            state.push(ON_STACK);
        } else if (vis[i]) {
            state.push(VIS);
        } else {
            state.push(UNVIS);
        }
    }
    states.push(state);

    adj[v].forEach((u) => {
        if (!vis[u]) {
            dfs_rec(u);
            state = [];
            for (let i = 0; i < nodes.length; i++) {
                if (i == v) {
                    state.push(CUR);
                } else if (on_stack.has(i)) {
                    state.push(ON_STACK);
                } else if (vis[i]) {
                    state.push(VIS);
                } else {
                    state.push(UNVIS);
                }
            }
            states.push(state);
        }
    });
    on_stack.delete(v);
}

function dfs(v) {
    getEdges();
    vis = [];
    for (let i = 0; i < nodes.length; i++) {
        vis.push(false);
    }
    dfs_rec(v);
    states.push(new Array(nodes.length).fill(VIS));
}

document.getElementById("canvas-graph").onclick = function(event) {
    if (edit_mode) {
        let x = event.clientX, y = event.clientY;
        nodes.push([x, y]);
        state_id = 0;
        redraw();
    }
};

document.onkeydown = function(event) {
    if (edit_mode) {
        if (event.key === "u") {
            nodes.pop();
            state_id = 0;
            redraw();
        }
    } else {
        if (event.key === "ArrowRight") {
            state_id = (state_id == states.length - 1 ? states.length - 1 : state_id + 1);
            redraw();
        } else if (event.key === "ArrowLeft") {
            state_id = (state_id == 0 ? 0 : state_id - 1);
            redraw();
        }
    }
};

/*
1 7
1 3
3 4
1 2
2 5
5 6
*/
