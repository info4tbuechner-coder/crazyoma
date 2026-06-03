
import React from 'react';
import { Disclosure, Transition } from '@headlessui/react';
import type { Advice } from '../types';
import { ChevronDownIcon } from './ui/Icons';

interface AdviceCardProps {
    advice: Advice;
}

const AdviceCard: React.FC<AdviceCardProps> = ({ advice }) => {
    return (
        <Disclosure>
            {({ open }) => (
                <div className="bg-slate-800/40 rounded-lg border border-slate-700/60">
                    <Disclosure.Button className="flex justify-between w-full px-4 py-3 text-sm font-medium text-left text-purple-300 hover:bg-slate-700/30 rounded-lg focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75">
                        <span className="text-base">{advice.titel}</span>
                        <ChevronDownIcon className={`w-6 h-6 transform transition-transform text-purple-400 ${open ? 'rotate-180' : ''}`} />
                    </Disclosure.Button>
                    <Transition
                        enter="transition duration-100 ease-out"
                        enterFrom="transform scale-95 opacity-0"
                        enterTo="transform scale-100 opacity-100"
                        leave="transition duration-75 ease-out"
                        leaveFrom="transform scale-100 opacity-100"
                        leaveTo="transform scale-95 opacity-0"
                    >
                        <Disclosure.Panel className="px-4 pt-2 pb-4 text-sm text-slate-300 prose prose-invert max-w-none prose-p:my-1">
                            {advice.text}
                        </Disclosure.Panel>
                    </Transition>
                </div>
            )}
        </Disclosure>
    );
};

export default AdviceCard;