<script>
    import { onMount, onDestroy } from 'svelte';
    import * as d3 from 'd3';
    import { get, writable } from 'svelte/store';
    import NodeComponent from './NodeComponent.svelte';
    import Conversation from './Conversation.svelte';
    import { init, text } from 'svelte/internal';
    import {conversation, selectedNode, reactiveNodes, reactiveLinks, convFormData} from './store'
    
    



    let graphData = conversation.createGraphData();

    let nodesData = graphData.nodes;
    let linksData = graphData.links;

    reactiveNodes.set(nodesData);
    reactiveLinks.set(linksData);



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

        // get current width and height of graph-view div
        let svgWidth = document.getElementById('graph-view').clientWidth;
        let svgHeight = document.getElementById('graph-view').clientHeight;
        window.addEventListener("resize", () => {
            svgWidth = document.getElementById('graph-view').clientWidth;
            svgHeight = document.getElementById('graph-view').clientHeight;
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
            reactiveNodes.set(nodesData);
            reactiveLinks.set(linksData);
        });

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);


        conversation.subscribe(updateGraph);
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

        let maxId = conversation.getNewMaxId();

        convFormData.set({
            nodeId: maxId,
            originNodeId: d.id,
            prompt: d.prompt,
            answer: d.answer
        });
        selectedNode.set(d);

    }

    // Function to handle the submission of new conversation data
    function addNewConvData() {
        // add new conversation data to conversation array
        conversation.addConvEntry($convFormData);
    }


    // Function to update the graph with new conversation data
    function updateGraph() {
        const updatedGraphData = conversation.createGraphData();
        nodesData = updatedGraphData.nodes;
        linksData = updatedGraphData.links;
        simulation.nodes(nodesData);
        simulation.force("link").links(linksData);
        simulation.alpha(1).restart();
    }





    onDestroy(() => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    });
</script>

 <!-- main div is size of screen -->
<div class="main-page-component">
    <div class="graph-view" id="graph-view">
        <svg width="100%" height="100%">
            {#each $reactiveLinks as link}
                <line x1={link.source.x + svgTransform.x} y1={link.source.y + svgTransform.y} x2={link.target.x + svgTransform.x} y2={link.target.y + svgTransform.y} stroke="black" />
            {/each}
        </svg>

        <div>
            {#each $reactiveNodes as node}
                <!-- node component -->
                <NodeComponent {node} {handleMouseDown} {svgTransform}/>

            {/each}
        </div>
    </div>
    <div class="conversation-view"> 
        <div class="conversation-history">
            <Conversation/>
        </div>
        <div class="form-view">
            <!-- HTML for adding new conversation data -->
            <form on:submit|preventDefault={addNewConvData}>
                <!-- <input bind:value={newConvData.nodeId} placeholder="Resulting Node ID" />
                <input bind:value={newConvData.originNodeId} placeholder="Origin Node ID" /> -->
                <textarea class="prompt" bind:value={$convFormData.prompt} placeholder="Prompt" />
                <button type="submit">Add to Conversation</button>
            </form>
        </div>
    </div>

    <style>

        /* flex divide between graph-view and form view so that it splits the main-page-component in half on the horizontal axis */

        .main-page-component {
            display: flex;
            flex-direction: row;
            height: 100vh;
            width: 100vw;
        }

        .graph-view {
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
            over-flow: hidden;
            
        }


        .conversation-view {
            display: flex;
            flex-direction: column;
            align-items: start; /* Aligns children to the start of the flex container */
            justify-content: start; 
            flex: 1;
            position: relative;
        }

        .conversation-history {
            display: flex;
            flex-direction: column;
            align-items: start; /* Aligns children to the start of the flex container */
            justify-content: start; 
            flex: 4;
            position: relative;
            background-color: #f0f0f0;
            border: 1px solid black;
            border-radius: 5px;
            padding: 15px;
            margin: 5px;
            width: 100%
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
            width: 100%

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