import { getSessionStorageItem } from '@/utils/sessionStorage';
import Image from 'next/image';
import React from 'react';
import { Message } from './hooks/useSignalHandlers';

const Chats = ({ chatList }: { chatList: Message[] }) => {
    return (
        <div className="flex gap-dr-10 flex-col h-full w-full ">
            {chatList.map((chat, index) => (
                <div key={index} className="flex items-start p-2 rounded-lg">
                    <div className="relative mr-2 min-w-[2rem] min-h-[2rem] rounded-full overflow-hidden">
                        <Image
                            src={`${chat?.imageUrl || '/images/speaking.png'}`}
                            alt="Profile"
                            fill
                        />
                    </div>
                    <div className="flex flex-col">
                        <div className="flex items-center">
                            <span className="font-semibold text-slate-300 text-dr-body-3">
                                {chat?.nickname}
                            </span>
                            <span className="text-slate-500 text-dr-body-4 ml-2">
                                {chat?.time &&
                                    new Date(chat?.time).toLocaleDateString()}
                            </span>{' '}
                        </div>
                        <div className="text-slate-200 text-dr-body-4">
                            {chat.messageForm}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Chats;
