from flask import Flask, render_template, request, jsonify
from solver import solve_puzzle, is_solvable

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/solve', methods=['POST'])
def solve():
    data = request.get_json()
    start_state = data.get("state")

    if not start_state or len(start_state) != 9:
        return jsonify({"error": "Invalid puzzle state"}), 400

    if not is_solvable(start_state):
        return jsonify({"error": "This puzzle is not solvable"}), 400

    result = solve_puzzle(start_state)

    if result is None:
        return jsonify({"error": "No solution found"}), 400

    return jsonify({
        "steps": len(result["path"]) - 1,
        "path": result["path"],
        "moves": result["moves"],
        "tree_edges": result["tree_edges"]
    })

if __name__ == '__main__':
    app.run(debug=True)