
import { writable } from 'svelte/store';

export const reactiveNodes = writable(null);
export const reactiveLinks = writable(null);
export const selectedNode = writable(null);




let INITIAL_CONV = [
    { nodeId: 0, originNodeId: 0,  prompt: "Can you explain PCA?", answer: "PCA is Principle Component Analysis..." },
    // { nodeId: 1, originNodeId: 0,  prompt: "What is the covariance matrix?", answer: "The covariance matrix is a square matrix..." },
    // { nodeId: 2, originNodeId: 1,  prompt: "What is the covariance matrix?", answer: "The covariance matrix is a square matrix..." },
    // { nodeId: 3, originNodeId: 2,  prompt: "How do you calculate the covariance matrix?", answer: "It is done by comparing how two variables..." },
    // { nodeId: 4, originNodeId: 1,  prompt: "Can you explain eigen vectors and eigen values?", answer: "Eigen vectors and eigen values are vectors..." },
    // { nodeId: 5, originNodeId: 4,  prompt: "How do we find the eigen values and eigen vectors?", answer: "We can calculate the eigen vectors and eigen values by solving Av = (lambda)v..." },
    // { nodeId: 7, originNodeId: 2,  prompt: "Can you give a visual explanation of the covariant matrix", answer: "Here is a visual expiation lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum " },
];


let INITIAL_CONV_FORM_DATA = { originNodeId: 0, prompt: 'Is this working', answer: 'Yes it is' };

// create conversation custom store
function createConversation(conversation) {

    const { subscribe, set, update } = writable(conversation);

    function addConvEntry(convEntry) {
        update(currentConversation => {
            currentConversation.push(convEntry);
            return currentConversation;
        });
    }

    return { subscribe, addConvEntry, set}
}


// conv form data store

function createConvFormData(convFormData) {
        const { subscribe, set, update } = writable(convFormData);
    
        return { subscribe, set }
    }


export const conversation = createConversation(INITIAL_CONV);
export const convFormData = createConvFormData(INITIAL_CONV_FORM_DATA);


