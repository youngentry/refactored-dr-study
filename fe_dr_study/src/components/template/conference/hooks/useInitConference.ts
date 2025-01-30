import { useDispatch } from 'react-redux';
import { useEffect, useRef, useState } from 'react';
import { setIsAvatarSpeaking } from '@/store/slices/isAvatarSpeakingSlice';
import { setTimeForAvatarSpeaking } from '@/store/slices/timeForAvatarSpeakingSlice';
import { setIsMutedBySystem } from '@/store/slices/isMutedBySystemSlice';
import { setGptSummaryBySystem } from '@/store/slices/gptSummaryBySystemSlice';
import { initSummaryMessages } from '@/store/slices/summaryMessagesSlice';
import { setAvatarDialogue } from '@/store/slices/avatarDialogueSlice';
import { setTimeForAudioRecord } from '@/store/slices/timeForAudioRecord';
import { setFocusingId } from '@/store/slices/conferenceFocusingPeerIdSlice';

const useInitConference = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        console.log('initConference');
        dispatch(setIsAvatarSpeaking(false));
        dispatch(setTimeForAvatarSpeaking(0));
        dispatch(setIsMutedBySystem(false));
        dispatch(setGptSummaryBySystem(''));
        dispatch(initSummaryMessages());
        dispatch(setAvatarDialogue(''));
        dispatch(setTimeForAudioRecord(0));
        dispatch(setFocusingId(''));
    }, []);
};

export default useInitConference;
