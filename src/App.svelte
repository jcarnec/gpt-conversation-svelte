<script>
    import { onMount, onDestroy } from 'svelte';
    import * as d3 from 'd3';
    import { writable } from 'svelte/store';
    import NodeComponent from './NodeComponent.svelte';
    import { init, text } from 'svelte/internal';


    

    let conv = [
        { nodeId: 0, originNodeId: 0,  prompt: "Can you explain PCA?", answer: "PCA is Principle Component Analysis..." },
        { nodeId: 1, originNodeId: 0,  prompt: "What is the covariance matrix?", answer: "The covariance matrix is a square matrix..." },
        { nodeId: 2, originNodeId: 1,  prompt: "What is the covariance matrix?", answer: "The covariance matrix is a square matrix..." },
        { nodeId: 3, originNodeId: 2,  prompt: "How do you calculate the covariance matrix?", answer: "It is done by comparing how two variables..." },
        { nodeId: 4, originNodeId: 1,  prompt: "Can you explain eigen vectors and eigen values?", answer: "Eigen vectors and eigen values are vectors..." },
        { nodeId: 5, originNodeId: 4,  prompt: "How do we find the eigen values and eigen vectors?", answer: "We can calculate the eigen vectors and eigen values by solving Av = (lambda)v..." },
        { nodeId: 7, originNodeId: 2,  prompt: "Can you give a visual explanation of the covariant matrix", answer: "Here is a visual expiation lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum " },
    ];


    // let conv = [
    //     { nodeId: 0, originNodeId: 0,  prompt: "Can you explain PCA?", answer: "PCA is Principle Component Analysis..." },
    //     { nodeId: 1, originNodeId: 0,  prompt: "What is the covariance matrix?", answer: "The covariance matrix is a square matrix..." },
    //     { nodeId: 2, originNodeId: 2,  prompt: "How do we find the eigen values and eigen vectors?", answer: "We can calculate the eigen vectors and eigen values by solving Av = (lambda)v..." },
    //     { nodeId: 3, originNodeId: 2,  prompt: "Can you give a visual explanation of the covariant matrix", answer: "Here is a visual expiation lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum " },
    // ];

    let newConvData = { nodeId: 8, originNodeId: 7, prompt: 'Is this working', answer: 'Yes it is' };


    // Function to handle the submission of new conversation data
    function addNewConvData() {
        conv.push({ ...newConvData });
        updateGraph();
    }

    // Function to update the graph with new conversation data
    function updateGraph() {
        const updatedGraphData = createGraphData(conv);
        nodesData = updatedGraphData.nodes;
        linksData = updatedGraphData.links;
        simulation.nodes(nodesData);
        simulation.force("link").links(linksData);
        simulation.alpha(1).restart();
    }

    function createGraphData(conversation) {
            const nodes = [];
            const links = [];
            const nodeSet = new Set();



            for (const { nodeId, originNodeId, prompt, answer } of conversation) {
                // Add node if it's not already in the set
                if (!nodeSet.has(nodeId)) {
                    nodes.push({ id: nodeId, prompt, answer });
                    nodeSet.add(nodeId);
                }

                // Add link
                if (originNodeId != nodeId) {
                    links.push({ source: originNodeId, target: nodeId });
                }
            }

            // sort nodes by id
            nodes.sort((a, b) => a.id - b.id);

            // find all root nodes by finding all nodes that are not targets
            const roots = nodes.filter(node => !links.find(link => link.target === node.id));
            
            for (let root of roots) {
                root.branchNumber = 0;
                root.level = 0;
                const stack = [root];
                while (stack.length) {
                    const node = stack.pop();
                    for (const link of links) {
                        if (link.source === node.id) {

                            const targetNode = nodes.find(node => node.id === link.target);
                            targetNode.level = node.level + 1;


                            // find all links that have the node as the source
                            let linksWithNodeAsSource = links.filter(link => link.source === node.id);
                            // assign a branch number to each link based on the id of the link in the array
                            linksWithNodeAsSource.forEach((link, index) => {
                                link.branchNumber = index + 1;
                            });
                            // assign the branch number to the target node
                            targetNode.branchNumber = link.branchNumber;

                            stack.push(targetNode);
                        }
                    }
                }
            }

            console.log(nodes, links)

            return { nodes, links };
    }

    let graphData = createGraphData(conv);
    let nodesData = graphData.nodes;
    let linksData = graphData.links;

    const nodes = writable(nodesData);
    const links = writable(linksData);

    let simulation;
    let isDragging = false;
    let draggedNode = null;


    let isPanning = false;
    let panStart = { x: 0, y: 0 };
    let svgTransform = { x: 0, y: 0 };

    function startPanning(event) {
        if (event.target.tagName !== 'svg') return; // Ignore if not clicking on SVG background
        isPanning = true;
        panStart = { x: event.clientX, y: event.clientY };
    }

    function doPanning(event) {
        if (!isPanning) return;
        let dx = event.clientX - panStart.x;
        let dy = event.clientY - panStart.y;
        panStart = { x: event.clientX, y: event.clientY };
        svgTransform.x += dx;
        svgTransform.y += dy;
    }

    function endPanning() {
        isPanning = false;
    }





    onMount(() => {

        // get current width and height of svg-view div
        let svgWidth = document.getElementById('svg-view').clientWidth;
        let svgHeight = document.getElementById('svg-view').clientHeight;
        window.addEventListener("resize", () => {
            svgWidth = document.getElementById('svg-view').clientWidth;
            svgHeight = document.getElementById('svg-view').clientHeight;
            // restart simulation
            simulation.force('center', d3.forceCenter(svgWidth / 2, svgHeight / 2));
            simulation.alpha(1).restart();

        });

        // Add event listeners for panning
        const svgElement = document.querySelector('svg');
        svgElement.addEventListener('mousedown', startPanning);
        window.addEventListener('mousemove', doPanning);
        window.addEventListener('mouseup', endPanning);

        // get the number of levels in the graph
        const numberOfLevels = Math.max(...nodesData.map(node => node.level)) + 1;

        simulation = d3.forceSimulation(nodesData)
            .force('link', d3.forceLink(linksData).id(d => d.id).distance(d => 200))
            .force('charge', d3.forceManyBody().strength(-1000))
            .force('collision', d3.forceCollide().radius(100))
            // .force('center', d3.forceCenter(width / 2, height / 2) * 0.1) 
            .force('x', d3.forceX().strength(0.1).x(d => {
                const level = d.level;
                const levelWidth = svgWidth / numberOfLevels;
                return levelWidth * level;
            }))

        simulation.on('tick', () => {
            nodes.set(nodesData);
            links.set(linksData);
        });

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    });

    function handleMouseDown(event, node) {
        event.preventDefault();
        isDragging = true;
        draggedNode = node;
        simulation.alphaTarget(0.3).restart();
        node.fx = node.x;
        node.fy = node.y;
        nodeClicked(node)
    }

    function handleMouseMove(event) {
        if (!isDragging || !draggedNode) return;
        draggedNode.fx += event.movementX;
        draggedNode.fy += event.movementY;
    }

    function handleMouseUp() {
        if (!isDragging || !draggedNode) return;
        isDragging = false;
        simulation.alphaTarget(0);
        draggedNode.fx = null;
        draggedNode.fy = null;
        draggedNode = null;
    }

    function nodeClicked(d) {

        // get the max id + 1

        let maxId = Math.max(...conv.map(o => o.nodeId), 0) + 1;

        newConvData.nodeId = maxId;
        newConvData.originNodeId = d.id;
        newConvData.prompt = d.prompt;
        newConvData.answer = d.answer;
    }




    onDestroy(() => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    });
</script>

 <!-- main div is size of screen -->
<div class="main-page-component">
    <div class="svg-view" id="svg-view">
        <svg width="100%" height="100%">
            {#each $links as link}
                <line x1={link.source.x + svgTransform.x} y1={link.source.y + svgTransform.y} x2={link.target.x + svgTransform.x} y2={link.target.y + svgTransform.y} stroke="black" />
            {/each}
        </svg>

        <div>
            {#each $nodes as node}
                <!-- node component -->
                <NodeComponent {node} {handleMouseDown} {nodeClicked} {svgTransform}/>

            {/each}
        </div>
    </div>
    <div class="divider" id="divider"></div> <!-- Draggable Divider -->
    <div class="form-view">
        <!-- HTML for adding new conversation data -->
        <form on:submit|preventDefault={addNewConvData}>
            <!-- <input bind:value={newConvData.nodeId} placeholder="Resulting Node ID" />
            <input bind:value={newConvData.originNodeId} placeholder="Origin Node ID" /> -->
            <textarea class="prompt" bind:value={newConvData.prompt} placeholder="Prompt" />
            <textarea class="answer" bind:value={newConvData.answer} placeholder="Answer" />
            <button type="submit">Add to Conversation</button>
        </form>
    </div>

    <style>

        /* flex divide between svg-view and form view so that it splits the main-page-component in half on the horizontal axis */

        .main-page-component {
            display: flex;
            flex-direction: row;
            height: 100vh;
            width: 100vw;
        }

        .svg-view {
            display: flex;
            flex-direction: column;
            flex: 1;
            position: relative;
            background-color: #f0f0f0;
            /* black rounded border */
            border: 1px solid black;
            border-radius: 5px;
            padding: 15px;
            margin: 5px;
            
        }

        .form-view {
            display: flex;
            flex-direction: column;
            align-items: start; /* Aligns children to the start of the flex container */
            justify-content: start; 
            flex: 1;
            position: relative;
            background-color: #f0f0f0;
            border: 1px solid black;
            border-radius: 5px;
            padding: 15px;
            margin: 5px;

        }

        /* svg view styling */

        svg {
            position: absolute;
            top: 0;
            left: 0;
            bottom: 0;
            right: 0;
        }


        /* form styling, have form take up entire form view div, with the prompt and the answer be scrollable on the y axis */

        /* should only apply to elements in form view */


        .form-view form {
            display: flex;
            flex-direction: column;
            height: 100%;
            width: 100%;
            padding: 5px;
        }

        .form-view button {
            margin-top: 5px;
            border-radius: 5px;
            border: 1px solid black;
            padding: 5px;
        }

        .form-view .answer {
            margin-bottom: 10px;
            border-radius: 5px;
            border: 1px solid black;
            padding: 5px;
            overflow-y: scroll;
            flex: 10;
        }

        .form-view input, .form-view textarea {
            margin-bottom: 5px;
            border-radius: 5px;
            border: 1px solid black;
            padding: 5px;
            text-align: left; /* Aligns text to the left */
        }

        .form-view .prompt, .form-view .answer {
            margin-bottom: 10px;
            border-radius: 5px;
            border: 1px solid black;
            padding: 5px;
            flex: 10;
            /* Remove overflow-y: scroll; and add height to define the area */
            height: 150px; /* Adjust height as needed */
        }

        /* Change input to textarea for multi-line text areas */
        .form-view textarea {
            resize: vertical; /* Allows resizing only vertically */
            overflow-y: auto; /* Automatically adds a scrollbar when needed */
            /* make font size large */
            FontFace = "Arial";
            font-size: 30px;
        }

        .divider {
            background-color: #666; /* Divider color */
            width: 5px; /* Divider width */
            cursor: ew-resize; /* Cursor indicates resizable area */
            position: absolute; /* Required for manual positioning */
            top: 0;
            bottom: 0;
        }




    </style>
</div>  

<!-- css  -->
<!-- place form in top right -->