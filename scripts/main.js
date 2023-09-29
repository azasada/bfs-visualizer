const RADIUS = 30
const FONT_SZ = 32;
const UNVIS = 0, ON_STACK = 1, VIS = 2, CUR = 3;
const RED = "#eb6f92", BLUE = "#31748f", GREEN = "#9ccfd8", YELLOW = "#f6c177", WHITE = "#e0def4";
// const BKG = "#fffaf3";
const BKG = "#191724";
let nodes = [], edges = [], dist = [], adj = [], states = [], queue_states = [];
let edit_mode = true, state_id = 0;

function redraw() {
    const canvas = document.getElementById("canvas-graph");
    if (canvas.getContext) {
        const c = canvas.getContext("2d");

        c.fillStyle = BKG;
        c.fillRect(0, 0, canvas.width, canvas.height);
        c.strokeStyle = WHITE;
        for (let i = 0; i < edges.length; i++) {
            c.beginPath();
            c.moveTo(nodes[edges[i][0]][0], nodes[edges[i][0]][1]);
            c.lineTo(nodes[edges[i][1]][0], nodes[edges[i][1]][1]);
            c.stroke();
        }
        c.strokeStyle = "black";
        document.getElementById("queue-content").textContent = "";
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
            c.font = FONT_SZ.toString() + "px sans";
            c.fillText((i + 1).toString(), nodes[i][0], nodes[i][1] + FONT_SZ / 3);
            
            if (states.length != 0 && (states[state_id][i] == VIS || states[state_id][i] == CUR)) {
                c.font = (FONT_SZ/1.66).toString() + "px sans";
                c.fillText(dist[i].toString(), nodes[i][0] + FONT_SZ / 2, nodes[i][1] + FONT_SZ / 3);
            }
        }
        if (queue_states.length > 0) {
            if (queue_states[state_id].length == 0) {
                document.getElementById("queue-content").textContent = "pusta";
            } else {
                for (let i = 0; i < queue_states[state_id].length; i++) {
                    document.getElementById("queue-content").textContent += (queue_states[state_id][i] + 1).toString() + " ";
                }
            }
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
    queue_states = [];
    let base_state = [];
    for (let i = 0; i < n; i++) {
        base_state.push(UNVIS);
    }
    states.push(base_state);
    queue_states.push([]);
    state_id = 0;

    redraw();
}

function bfs(v) {
    document.getElementById("error").textContent = "";
    document.getElementById("queue-content").textContent = "";

    getEdges();
    dist = new Array(nodes.length).fill(-1);
    let first_state = [];
    for (let i = 0; i < nodes.length; i++) {
        first_state.push(i == v ? ON_STACK : UNVIS);
    }
    states.push(first_state);
    queue_states.push([v]);

    let q = [v];
    let in_queue = new Set();
    in_queue.add(v);
    dist[v] = 0;
    while (q.length > 0) {
        v = q.shift();
        in_queue.delete(v);

        adj[v].forEach((u) => {
            if (dist[u] == -1) {
                q.push(u);
                dist[u] = dist[v] + 1;
                in_queue.add(u);
            }
        });

        let state = [];
        for (let i = 0; i < nodes.length; i++) {
            if (i == v) {
                state.push(CUR);
            } else if (in_queue.has(i)) {
                state.push(ON_STACK);
            } else if (dist[i] != -1) {
                state.push(VIS);
            } else {
                state.push(UNVIS);
            }
        }
        if (states.length == 0 || state != states[states.length - 1]) {
            states.push(state);
            queue_states.push(q.slice());
        }
    }

    last_state = [];
    for (let i = 0; i < nodes.length; i++) {
        last_state.push(dist[i] != -1 ? VIS : UNVIS);
    }
    states.push(last_state);
    queue_states.push(q.slice());
}

// let on_stack = new Set();
// function dfs_rec(v) {
//     vis[v] = true;
//     on_stack.add(v);
//
//     let state = [];
//     for (let i = 0; i < nodes.length; i++) {
//         if (i == v) {
//             state.push(CUR);
//         } else if (on_stack.has(i)) {
//             state.push(ON_STACK);
//         } else if (vis[i]) {
//             state.push(VIS);
//         } else {
//             state.push(UNVIS);
//         }
//     }
//     states.push(state);
//
//     adj[v].forEach((u) => {
//         if (!vis[u]) {
//             dfs_rec(u);
//             state = [];
//             for (let i = 0; i < nodes.length; i++) {
//                 if (i == v) {
//                     state.push(CUR);
//                 } else if (on_stack.has(i)) {
//                     state.push(ON_STACK);
//                 } else if (vis[i]) {
//                     state.push(VIS);
//                 } else {
//                     state.push(UNVIS);
//                 }
//             }
//             states.push(state);
//         }
//     });
//     on_stack.delete(v);
// }
//
// function dfs(v) {
//     document.getElementById("error").textContent = "";
//
//     getEdges();
//     vis = new Array(nodes.length).fill(false);
//     dfs_rec(v);
//
//     last_state = [];
//     for (let i = 0; i < nodes.length; i++) {
//         last_state.push(vis[i] ? VIS : UNVIS);
//     }
//     states.push(last_state);
// }

document.getElementById("canvas-graph").onclick = function(event) {
    let x = event.clientX, y = event.clientY;
    nodes.push([x, y]);
    state_id = 0;
    redraw();
};

document.onkeydown = function(event) {
    if (event.key === "u") {
        nodes.pop();
        state_id = 0;
        redraw();
    }
    if (event.key === "ArrowRight") {
        state_id = (state_id == states.length - 1 ? states.length - 1 : state_id + 1);
        redraw();
    } else if (event.key === "ArrowLeft") {
        state_id = (state_id == 0 ? 0 : state_id - 1);
        redraw();
    }
};
