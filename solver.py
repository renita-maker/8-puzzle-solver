import heapq

GOAL_STATE = [1, 2, 3, 4, 5, 6, 7, 8, 0]

MOVES = {
    0: [1, 3],
    1: [0, 2, 4],
    2: [1, 5],
    3: [0, 4, 6],
    4: [1, 3, 5, 7],
    5: [2, 4, 8],
    6: [3, 7],
    7: [4, 6, 8],
    8: [5, 7]
}

def heuristic(state):
    distance = 0
    for i, value in enumerate(state):
        if value != 0:
            goal_index = GOAL_STATE.index(value)
            x1, y1 = divmod(i, 3)
            x2, y2 = divmod(goal_index, 3)
            distance += abs(x1 - x2) + abs(y1 - y2)
    return distance

def is_solvable(state):
    arr = [x for x in state if x != 0]
    inversions = 0
    for i in range(len(arr)):
        for j in range(i + 1, len(arr)):
            if arr[i] > arr[j]:
                inversions += 1
    return inversions % 2 == 0

def get_move_name(old_zero, new_zero):
    diff = new_zero - old_zero
    if diff == -3:
        return "Up"
    elif diff == 3:
        return "Down"
    elif diff == -1:
        return "Left"
    elif diff == 1:
        return "Right"
    return "Move"

def get_neighbors_with_moves(state):
    zero_index = state.index(0)
    neighbors = []

    for move in MOVES[zero_index]:
        new_state = state[:]
        moved_tile = new_state[move]
        new_state[zero_index], new_state[move] = new_state[move], new_state[zero_index]
        move_name = get_move_name(zero_index, move)
        neighbors.append((new_state, move_name, moved_tile))

    return neighbors

def solve_puzzle(start_state):
    start_tuple = tuple(start_state)
    goal_tuple = tuple(GOAL_STATE)

    open_list = []
    heapq.heappush(open_list, (heuristic(start_state), 0, start_tuple))

    g_cost = {start_tuple: 0}
    parent = {start_tuple: None}
    move_info = {start_tuple: None}

    visited = set()

    while open_list:
        f, g, current = heapq.heappop(open_list)

        if current in visited:
            continue
        visited.add(current)

        if current == goal_tuple:
            break

        current_list = list(current)
        for neighbor, move_name, moved_tile in get_neighbors_with_moves(current_list):
            neighbor_tuple = tuple(neighbor)
            tentative_g = g + 1

            if neighbor_tuple not in g_cost or tentative_g < g_cost[neighbor_tuple]:
                g_cost[neighbor_tuple] = tentative_g
                parent[neighbor_tuple] = current
                move_info[neighbor_tuple] = {
                    "direction": move_name,
                    "tile": moved_tile
                }
                heapq.heappush(
                    open_list,
                    (tentative_g + heuristic(neighbor), tentative_g, neighbor_tuple)
                )

    if goal_tuple not in parent:
        return None

    # reconstruct path
    path = []
    moves = []
    tree_edges = []

    current = goal_tuple
    while current is not None:
        path.append(list(current))
        if move_info[current] is not None:
            moves.append(move_info[current])
        if parent[current] is not None:
            tree_edges.append({
                "from": list(parent[current]),
                "to": list(current),
                "move": move_info[current]
            })
        current = parent[current]

    path.reverse()
    moves.reverse()
    tree_edges.reverse()

    return {
        "path": path,
        "moves": moves,
        "tree_edges": tree_edges
    }