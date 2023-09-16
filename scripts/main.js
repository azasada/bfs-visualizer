const RADIUS = 30;
const FONT_SZ = 32;
let nodes = [], edges = [], vis = [], adj = [];
let states = [];
let edit_mode = 1, state_id = 0;

function changeMode() {
    edit_mode ^= 1;
}

function redraw() {
    const canvas = document.getElementById("canvas-graph");
    if (canvas.getContext) {
        const c = canvas.getContext("2d");
        c.font = FONT_SZ.toString() + "px sans";

        c.fillStyle = "white";
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
            if (states.length == 0 || states[state_id][i] == 0) {
                c.fillStyle = "red";
            } else if (states[state_id][i] == 1) {
                c.fillStyle = "blue";
            } else if (states[state_id][i] == 2) {
                c.fillStyle = "green";
            } else {
                c.fillStyle = "yellow";
            }
            c.fill();
            c.stroke();

            c.fillStyle = "black";
            c.fillText((i + 1).toString(), nodes[i][0] - FONT_SZ / 3, nodes[i][1] + FONT_SZ / 3);
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
        if (line.length != "") {
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
        base_state.push(0);
    }
    states.push(base_state);
    state_id = 0;

    redraw(0);
}

function bfs(v) {
    getEdges();
    vis = [];
    let first_state = [];
    for (let i = 0; i < nodes.length; i++) {
        vis.push(false);
        first_state.push(i == v ? 1 : 0);
    }
    states.push(first_state);

    let q = [v];
    let in_queue = new Set();
    in_queue.add(v);
    while (q.length > 0) {
        v = q.pop();
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
                state.push(3);
            } else if (in_queue.has(i)) {
                state.push(1);
            } else if (vis[i]) {
                state.push(2);
            } else {
                state.push(0);
            }
        }
        states.push(state);
    }
    states.push(new Array(nodes.length).fill(2));
}

let on_stack = new Set();
function dfs_rec(v) {
    vis[v] = true;
    on_stack.add(v);

    let state = [];
    for (let i = 0; i < nodes.length; i++) {
        if (i == v) {
            state.push(3);
        } else if (on_stack.has(i)) {
            state.push(1);
        } else if (vis[i]) {
            state.push(2);
        } else {
            state.push(0);
        }
    }
    states.push(state);

    adj[v].forEach((u) => {
        if (!vis[u]) {
            dfs_rec(u);
            state = [];
            for (let i = 0; i < nodes.length; i++) {
                if (i == v) {
                    state.push(3);
                } else if (on_stack.has(i)) {
                    state.push(1);
                } else if (vis[i]) {
                    state.push(2);
                } else {
                    state.push(0);
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
    states.push(new Array(nodes.length).fill(2));
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
            console.log("state: " + state_id);
            redraw();
        } else if (event.key === "ArrowLeft") {
            state_id = (state_id == 0 ? 0 : state_id - 1);
            console.log("state: " + state_id);
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
