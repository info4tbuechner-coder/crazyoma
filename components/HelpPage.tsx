import React from 'react';
import { Disclosure, Tab } from '@headlessui/react';
import Card from './ui/Card';
// FIX: Corrected typo in constant name.
import { NARCISSISTIC_PATTERNS_DETAILS } from '../constants';

const HelpPage: React.FC = () => {
    return (
        <Card>
            <h2 className="text-3xl font-bold font-serif text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-2">
                Omas Lexikon der Fiesheiten
            </h2>
            <p className="text-slate-400 mb-8">
                Damit du weißt, womit du es zu tun hast, mein Kind. Wissen ist Macht!
            </p>
            <div className="w-full">
                {NARCISSISTIC_PATTERNS_DETAILS.map((pattern) => (
                    <Disclosure key={pattern.name} as="div" className="mt-2">
                        {({ open }) => (
                            <div className="bg-slate-800/40 rounded-lg border border-slate-700/60">
                                <Disclosure.Button className="flex justify-between w-full px-4 py-3 text-lg font-medium text-left text-purple-300 hover:bg-slate-700/30 rounded-t-lg focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75">
                                    <span>{pattern.name}</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 transform transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </Disclosure.Button>
                                <Disclosure.Panel className="px-4 pt-2 pb-4">
                                    <Tab.Group>
                                        <Tab.List className="flex p-1 space-x-1 bg-slate-900/50 rounded-xl max-w-sm">
                                            <Tab className={({ selected }) =>
                                                `w-full py-2.5 text-sm leading-5 font-medium text-purple-100 rounded-lg
                                                focus:outline-none focus:ring-2 ring-offset-2 ring-offset-purple-400 ring-white ring-opacity-60
                                                ${selected ? 'bg-white/[0.12] shadow' : 'text-purple-200 hover:bg-white/[0.12] hover:text-white'}`
                                            }>Oma erklärt</Tab>
                                            <Tab className={({ selected }) =>
                                                `w-full py-2.5 text-sm leading-5 font-medium text-purple-100 rounded-lg
                                                focus:outline-none focus:ring-2 ring-offset-2 ring-offset-purple-400 ring-white ring-opacity-60
                                                ${selected ? 'bg-white/[0.12] shadow' : 'text-purple-200 hover:bg-white/[0.12] hover:text-white'}`
                                            }>Schlaumeier-Modus</Tab>
                                        </Tab.List>
                                        <Tab.Panels className="mt-3">
                                            <Tab.Panel className="text-slate-300 p-3 bg-black/10 rounded-lg">{pattern.simple}</Tab.Panel>
                                            <Tab.Panel className="text-slate-300 p-3 bg-black/10 rounded-lg text-sm">{pattern.scientific}</Tab.Panel>
                                        </Tab.Panels>
                                    </Tab.Group>
                                </Disclosure.Panel>
                            </div>
                        )}
                    </Disclosure>
                ))}
            </div>
        </Card>
    );
}

export default HelpPage;