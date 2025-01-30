import { createSlice } from '@reduxjs/toolkit';

interface SummaryMessageInterface {
    message: string;
    time: string;
}

interface summaryMessagesState {
    summaryMessages: SummaryMessageInterface[];
}

const initialState: summaryMessagesState = {
    summaryMessages: [],
};

const summaryMessagesSlice = createSlice({
    name: 'summaryMessages',
    initialState,
    reducers: {
        pushSummaryMessages: (state, actions) => {
            state.summaryMessages.push(actions.payload);
        },
        initSummaryMessages: (state) => {
            state.summaryMessages = [];
        },
    },
});

export const { pushSummaryMessages, initSummaryMessages } =
    summaryMessagesSlice.actions;
export default summaryMessagesSlice.reducer;
