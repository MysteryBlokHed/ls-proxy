const state = [];
let stateIndex = 0;
const resetContext = () => (stateIndex = 0);
const useState = (value) => {
    if (stateIndex in state) {
        const index = stateIndex;
        stateIndex++;
        return [state[index], (value) => (state[index] = value)];
    }
    else {
        state.push(value);
        const index = stateIndex;
        stateIndex++;
        return [state[index], (value) => (state[index] = value)];
    }
};
