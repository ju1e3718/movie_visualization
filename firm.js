(function () {
    const edges = [];
    const connectedNodes = new Set();
    const makerSet = new Set();

    // Collect makers and movies
    movies.forEach(movie => {
        const makers = movie['maker'] || []; // Use an empty array if the maker field is missing
        const movieName = movie['영화명'];

        makers.forEach(maker => {
            makerSet.add(maker); // Mark this as a maker

            // Create edges between makers and movies
            edges.push({ from: maker, to: movieName, color: '#cccccc' });
            connectedNodes.add(maker);
            connectedNodes.add(movieName);
        });
    });

    // Add nodes
    const nodes = [];
    connectedNodes.forEach(node => {
        const color = makerSet.has(node) ? 'skyblue' : 'pink'; // Skyblue for makers, pink for movies
        nodes.push({ id: node, label: node, color });
    });

    // Create the network graph with vis.js
    const container = document.getElementById('network');
    const dataSet = {
        nodes: new vis.DataSet(nodes),
        edges: new vis.DataSet(edges)
    };
    const options = {
        layout: {
            improvedLayout: false // Disable improved layout for better performance
        }
    };
    const network = new vis.Network(container, dataSet, options);

    // Function to reset the colors of all nodes and edges to default
    function resetColors() {
        dataSet.nodes.update(nodes.map(node => ({
            id: node.id,
            label: node.label,
            color: makerSet.has(node.id) ? 'skyblue' : 'pink' // Reset to default color
        })));

        dataSet.edges.update(edges.map(edge => ({
            id: edge.id,
            from: edge.from,
            to: edge.to,
            color: '#cccccc' // Reset to default color
        })));
    }

    // Function to highlight a specific maker or movie and their connected nodes and edges
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

    // Button click event to highlight the person (maker or movie) entered in the search input
    document.getElementById('search-button').addEventListener('click', function() {
        const personName = document.getElementById('search-input').value.trim();
        if (personName) {
            highlightPerson(personName);
        }
    });
})();
