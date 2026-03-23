let solutionPath = [];
let solutionMoves = [];
let treeEdges = [];
let currentStep = 0;
let playInterval = null;

function getInputState() {
    const inputs = document.querySelectorAll('.tile-input');
    let values = [];

    for (let input of inputs) {
        let value = input.value.trim();
        if (value === "") {
            return null;
        }
        values.push(Number(value));
    }

    return values;
}

function validateState(state) {
    if (!state || state.length !== 9) return "Please fill all 9 boxes.";

    const sorted = [...state].sort((a, b) => a - b);
    for (let i = 0; i < 9; i++) {
        if (sorted[i] !== i) {
            return "Use all numbers from 0 to 8 exactly once.";
        }
    }
    return null;
}

function renderBoard(state) {
    const board = document.getElementById("board");
    board.innerHTML = "";

    state.forEach(num => {
        const tile = document.createElement("div");
        tile.classList.add("tile");

        if (num === 0) {
            tile.classList.add("empty");
            tile.textContent = "";
        } else {
            tile.textContent = num;
        }

        board.appendChild(tile);
    });

    document.getElementById("stateCount").textContent = `State: ${currentStep}`;
    highlightCurrentStep();
}

function createMiniBoard(state) {
    const miniBoard = document.createElement("div");
    miniBoard.className = "mini-board";

    state.forEach(num => {
        const tile = document.createElement("div");
        tile.className = "mini-tile";
        if (num === 0) {
            tile.classList.add("mini-empty");
            tile.textContent = "";
        } else {
            tile.textContent = num;
        }
        miniBoard.appendChild(tile);
    });

    return miniBoard;
}

function renderSteps() {
    const container = document.getElementById("stepsContainer");
    container.innerHTML = "";

    if (solutionPath.length === 0) return;

    solutionPath.forEach((state, index) => {
        const card = document.createElement("div");
        card.className = "step-card";
        card.id = `step-card-${index}`;

        const title = document.createElement("div");
        title.className = "step-title";

        if (index === 0) {
            title.textContent = `Step 0: Initial State`;
        } else {
            const move = solutionMoves[index - 1];
            title.textContent = `Step ${index}: Move tile ${move.tile} ${move.direction}`;
        }

        card.appendChild(title);
        card.appendChild(createMiniBoard(state));
        container.appendChild(card);
    });
}

function renderTree() {
    const container = document.getElementById("treeContainer");
    container.innerHTML = "";

    if (solutionPath.length === 0) return;

    solutionPath.forEach((state, index) => {
        const node = document.createElement("div");
        node.className = "tree-node";

        const title = document.createElement("div");
        title.className = "step-title";
        title.textContent = `Node ${index}`;

        node.appendChild(title);
        node.appendChild(createMiniBoard(state));

        if (index > 0) {
            const label = document.createElement("span");
            label.className = "move-label";
            label.textContent = `From previous: tile ${solutionMoves[index - 1].tile} moved ${solutionMoves[index - 1].direction}`;
            node.appendChild(label);
        }

        container.appendChild(node);

        if (index < solutionPath.length - 1) {
            const arrow = document.createElement("div");
            arrow.className = "tree-arrow";
            arrow.textContent = "↓";
            container.appendChild(arrow);
        }
    });
}

function highlightCurrentStep() {
    document.querySelectorAll(".step-card").forEach(card => {
        card.style.outline = "none";
        card.style.background = "rgba(255,255,255,0.08)";
    });

    const active = document.getElementById(`step-card-${currentStep}`);
    if (active) {
        active.style.outline = "2px solid #38bdf8";
        active.style.background = "rgba(56,189,248,0.12)";
        active.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
}

async function solvePuzzle() {
    const message = document.getElementById("message");
    const state = getInputState();

    const validationError = validateState(state);
    if (validationError) {
        message.textContent = validationError;
        return;
    }

    message.textContent = "Solving...";
    pauseAnimation();

    try {
        const response = await fetch("/solve", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ state: state })
        });

        const data = await response.json();

        if (!response.ok) {
            message.textContent = data.error || "Something went wrong.";
            return;
        }

        solutionPath = data.path;
        solutionMoves = data.moves;
        treeEdges = data.tree_edges;
        currentStep = 0;

        renderBoard(solutionPath[currentStep]);
        renderSteps();
        renderTree();

        document.getElementById("stepCount").textContent = `Steps: ${data.steps}`;
        message.textContent = "Solution found!";
    } catch (error) {
        message.textContent = "Server error. Please try again.";
    }
}

function nextStep() {
    if (solutionPath.length === 0) return;
    if (currentStep < solutionPath.length - 1) {
        currentStep++;
        renderBoard(solutionPath[currentStep]);
    }
}

function prevStep() {
    if (solutionPath.length === 0) return;
    if (currentStep > 0) {
        currentStep--;
        renderBoard(solutionPath[currentStep]);
    }
}

function playAnimation() {
    if (solutionPath.length === 0) return;
    pauseAnimation();

    playInterval = setInterval(() => {
        if (currentStep < solutionPath.length - 1) {
            currentStep++;
            renderBoard(solutionPath[currentStep]);
        } else {
            pauseAnimation();
        }
    }, 700);
}

function pauseAnimation() {
    if (playInterval) {
        clearInterval(playInterval);
        playInterval = null;
    }
}

function fillSample() {
    const sample = [1, 2, 3, 4, 0, 6, 7, 5, 8];
    const inputs = document.querySelectorAll('.tile-input');
    inputs.forEach((input, index) => {
        input.value = sample[index];
    });
    document.getElementById("message").textContent = "Sample puzzle loaded.";
}

function clearGrid() {
    const inputs = document.querySelectorAll('.tile-input');
    inputs.forEach(input => input.value = "");

    pauseAnimation();
    solutionPath = [];
    solutionMoves = [];
    treeEdges = [];
    currentStep = 0;

    document.getElementById("board").innerHTML = "";
    document.getElementById("stepsContainer").innerHTML = "";
    document.getElementById("treeContainer").innerHTML = "";
    document.getElementById("message").textContent = "";
    document.getElementById("stepCount").textContent = "Steps: 0";
    document.getElementById("stateCount").textContent = "State: 0";
}