
import { create } from 'd3';
import { writable } from 'svelte/store';

export const reactiveLinks = writable(null);
export const selectedNode = writable(null);




let INITIAL_CONV = [
    { nodeId: 0, originNodeId: 0,  prompt: "Can you explain PCA?", answer: "PCA is Principle Component Analysis..." },
    { nodeId: 1, originNodeId: 0,  prompt: "What is the covariance matrix?", answer: "The covariance matrix is a square matrix..." },
    { nodeId: 2, originNodeId: 1,  prompt: "What is the covariance matrix?", answer: "The covariance matrix is a square matrix..." },
    { nodeId: 3, originNodeId: 2,  prompt: "How do you calculate the covariance matrix?", answer: "It is done by comparing how two variables..." },
    { nodeId: 4, originNodeId: 1,  prompt: "Can you explain eigen vectors and eigen values?", answer: "Eigen vectors and eigen values are vectors..." },
    { nodeId: 5, originNodeId: 4,  prompt: "How do we find the eigen values and eigen vectors?", answer: "We can calculate the eigen vectors and eigen values by solving Av = (lambda)v..." },
    { nodeId: 7, originNodeId: 2,  prompt: "Can you give a visual explanation of the covariant matrix", answer: "Here is a visual expiation lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum " },
];


let INITIAL_CONV_FORM_DATA = { originNodeId: 0, prompt: 'Is this working', answer: 'Yes it is' };




// reactiveNodes custom store
function createReactiveNodes(reactiveNodes) {
    const { subscribe, set, update } = writable(reactiveNodes);

    let selfRef = null;

    subscribe(value => {
        selfRef = value;
    })



    function getLineOfConversation(currentNode) {
        let line = [];
        let c = selfRef.find((n) => n.nodeId === currentNode.id);
        while (c) {
            line.push(c);
            c = getParent(c);
        }
        return line;
    }

    function getParent(c) {
        return conversation.find(n => n.nodeId === c.originNodeId && c.originNodeId !== c.nodeId);
        
    }


    return { subscribe, set, update, getLineOfConversation }
}


// create conversation custom store
function createConversation(conversation) {

    const { subscribe, set, update } = writable(conversation);

    let selfRef = null;

    subscribe(value => {
        selfRef = value;
    })

    function getNewMaxId() {
        Math.max(...(selfRef.map(o => o.nodeId)), 0) + 1;
    }

    function addConvEntry(convEntry) {
        update(currentConversation => {
            currentConversation.push(convEntry);
            return currentConversation;
        });
    }


    function createGraphData() {
            const nodes = [];
            const links = [];
            const nodeSet = new Set();



            for (const { nodeId, originNodeId, prompt, answer } of selfRef) {
                // Add node if it's not already in the set
                if (!nodeSet.has(nodeId)) {
                    nodes.push({ id: nodeId, prompt, answer, level: 0, branchNumber: 0 });
                    nodeSet.add(nodeId);
                }

                // Add link
                if (originNodeId != nodeId) {
                    links.push({ source: originNodeId, target: nodeId, branchNumber: 0 });
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

            return { nodes, links };
    }



    return { subscribe, addConvEntry, set, update, createGraphData, getNewMaxId}
}


// conv form data store

function createConvFormData(convFormData) {
        const { subscribe, set, update } = writable(convFormData);
    
        return { subscribe, set }
    }


export const conversation = createConversation(INITIAL_CONV);
export const convFormData = createConvFormData(INITIAL_CONV_FORM_DATA);
// for isolated tress you could create this inside a component.
export const reactiveNodes = createReactiveNodes(null);

