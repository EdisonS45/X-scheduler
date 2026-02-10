'use client'

import { useState } from 'react'

function splitTweets(text: string): string[] {
    return text
        .split(/\n\s*\n/) // split by empty lines
        .map(t => t.trim())
        .filter(Boolean)
}

export default function BulkTextInput() {
    const [rawText, setRawText] = useState('')
    const tweets = splitTweets(rawText)

    return (
        <div className="rounded-lg border bg-white p-6 space-y-6">
            {/* Textarea */}
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                    Paste your tweets
                </label>
                <textarea
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder="Paste tweets here. Separate each tweet with a blank line."
                    className="w-full min-h-[240px] rounded-md border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
            </div>

            {/* Summary */}
            {rawText && (
                <div className="rounded-md bg-slate-50 p-4 text-sm text-slate-700 space-y-2">
                    <p>
                        <strong>{tweets.length}</strong> tweets detected
                    </p>

                    {tweets.length > 0 && (
                        <>
                            <p className="text-slate-500">Preview:</p>

                            <div className="space-y-2">
                                {tweets.slice(0, 3).map((tweet, i) => (
                                    <div
                                        key={i}
                                        className="rounded border bg-white p-2 text-sm text-slate-800"
                                    >
                                        {tweet}
                                    </div>
                                ))}

                                {tweets.length > 3 && (
                                    <p className="text-xs text-slate-500">
                                        …and {tweets.length - 3} more
                                    </p>
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* CTA */}
            <div className="flex justify-end">
                <button
                    disabled={tweets.length === 0}
                    className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:bg-slate-300"
                >
                    Continue to Scheduling
                </button>
            </div>
        </div>
    )
}
