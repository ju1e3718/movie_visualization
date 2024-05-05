(function () {
    const pairCountCoach = {};
    const edges = [];
    const connectedNodes = new Set();
    const coachSet = new Set(); // To identify coaches

    movies.forEach(movie => {
        const coach = movie.coach;
        const mainActors = movie.actor_main_name || [];
        coachSet.add(coach); // Mark this as a coach

        mainActors.forEach(actor => {
            const pairKey = `${coach}-${actor}`;
            pairCountCoach[pairKey] = (pairCountCoach[pairKey] || 0) + 1;
        });
    });

    // Create edges for coach-actor pairs that have worked together in at least two movies
    Object.entries(pairCountCoach).forEach(([pairKey, count]) => {
        if (count >= 2) { // Change count threshold as needed
            const [coach, actor] = pairKey.split('-');
            edges.push({ from: coach, to: actor, color: '#cccccc' });
            connectedNodes.add(coach);
            connectedNodes.add(actor);
        }
    });

    // Only add nodes that are connected by at least one edge
    const nodes = [];
    connectedNodes.forEach(node => {
        const color = coachSet.has(node) ? 'skyblue' : 'pink'; // Blue for coaches, Pink for actors
        nodes.push({ id: node, label: node, color });
    });

    // Create the network graph with vis.js
    const container = document.getElementById('network');
    const dataSet = {
        nodes: new vis.DataSet(nodes),
        edges: new vis.DataSet(edges)
    };
    const options = {};
    const network = new vis.Network(container, dataSet, options);

    // Function to reset the colors of all nodes and edges to default
    function resetColors() {
        dataSet.nodes.update(nodes.map(node => ({
            id: node.id,
            label: node.label,
            color: coachSet.has(node.id) ? 'skyblue' : 'pink'
        })));

        dataSet.edges.update(edges.map(edge => ({
            id: edge.id,
            from: edge.from,
            to: edge.to,
            color: '#97C2FC'
        })));
    }

    // Function to highlight a specific coach or actor and their connected nodes and edges
    function highlightPerson(personName) {
        // Only proceed if the person exists in the connected nodes
        if (!connectedNodes.has(personName)) {
            return; // Do nothing if the person isn't found
        }

        resetColors(); // Reset the colors first

        const connectedEdges = [];
        const connectedNodesSet = new Set([personName]);

        dataSet.edges.forEach(edge => {
            if (edge.from === personName || edge.to === personName) {
                connectedEdges.push({
                    id: edge.id,
                    from: edge.from,
                    to: edge.to,
                    color: { color: 'red' }
                });
                connectedNodesSet.add(edge.from);
                connectedNodesSet.add(edge.to);
            }
        });

        dataSet.edges.update(connectedEdges);

        const updatedNodes = Array.from(connectedNodesSet).map(node => {
            return { id: node, label: node, color: node === personName ? 'red' : 'orange' };
        });
        dataSet.nodes.update(updatedNodes);
    }

    // Button click event to highlight the person (coach or actor) entered in the search input
    document.getElementById('search-button').addEventListener('click', function() {
        const personName = document.getElementById('search-input').value.trim();
        if (personName) {
            highlightPerson(personName);
        }
    });
})();
