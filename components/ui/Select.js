"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";
import { twMerge } from "tailwind-merge";

const baseCls =
    "w-full flex items-center justify-between gap-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-left text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed";

// options: array of primitives or { value, label }. onChange receives the option's value (original type).
export default function Select({ value, onChange, options = [], placeholder = "Select...", disabled, className, id, ...aria }) {
    const opts = options.map((o) => (typeof o === "object" ? o : { value: o, label: String(o) }));
    const selectedIdx = opts.findIndex((o) => o.value === value);
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(0);
    const rootRef = useRef(null);
    const listRef = useRef(null);
    const typeahead = useRef({ text: "", t: 0 });
    const listId = useId();
    const [pos, setPos] = useState(null);

    // List is portaled to <body> so parent overflow/stacking contexts (e.g. backdrop-blur cards) can't clip or cover it.
    useLayoutEffect(() => {
        if (!open) return;
        const place = () => {
            const r = rootRef.current?.getBoundingClientRect();
            if (!r) return;
            const below = window.innerHeight - r.bottom;
            const up = below < 270 && r.top > below; // flip upward when there's no room below
            setPos({ left: r.left, width: r.width, ...(up ? { bottom: window.innerHeight - r.top + 8 } : { top: r.bottom + 8 }) });
        };
        place();
        window.addEventListener("resize", place);
        window.addEventListener("scroll", place, true);
        return () => { window.removeEventListener("resize", place); window.removeEventListener("scroll", place, true); };
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const close = (e) => !rootRef.current?.contains(e.target) && !listRef.current?.contains(e.target) && setOpen(false);
        document.addEventListener("mousedown", close);
        return () => document.removeEventListener("mousedown", close);
    }, [open]);

    useEffect(() => {
        if (open) listRef.current?.children[active]?.scrollIntoView({ block: "nearest" });
    }, [open, active]);

    const openList = () => { setActive(Math.max(0, selectedIdx)); setOpen(true); };
    const choose = (i) => { if (opts[i]) onChange?.(opts[i].value); setOpen(false); };

    const onKeyDown = (e) => {
        if (disabled) return;
        const last = opts.length - 1;
        switch (e.key) {
            case "ArrowDown": case "ArrowUp": {
                e.preventDefault();
                if (!open) return openList();
                setActive((a) => (e.key === "ArrowDown" ? Math.min(last, a + 1) : Math.max(0, a - 1)));
                return;
            }
            case "Home": case "End":
                if (open) { e.preventDefault(); setActive(e.key === "Home" ? 0 : last); }
                return;
            case "Enter": case " ":
                e.preventDefault();
                return open ? choose(active) : openList();
            case "Escape":
                if (open) { e.preventDefault(); setOpen(false); }
                return;
            case "Tab":
                return setOpen(false);
            default:
                // typeahead: jump to first option starting with typed letters
                if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
                    const t = typeahead.current;
                    t.text = Date.now() - t.t < 600 ? t.text + e.key.toLowerCase() : e.key.toLowerCase();
                    t.t = Date.now();
                    const i = opts.findIndex((o) => o.label.toLowerCase().startsWith(t.text));
                    if (i >= 0) { if (open) setActive(i); else onChange?.(opts[i].value); }
                }
        }
    };

    return (
        <div ref={rootRef} className="relative">
            <button
                type="button"
                id={id}
                role="combobox"
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-controls={listId}
                aria-activedescendant={open ? `${listId}-${active}` : undefined}
                disabled={disabled || !opts.length}
                onClick={() => (open ? setOpen(false) : openList())}
                onKeyDown={onKeyDown}
                className={twMerge(baseCls, className)}
                {...aria}
            >
                <span className={`truncate ${selectedIdx < 0 ? "text-gray-400" : ""}`}>
                    {selectedIdx < 0 ? placeholder : opts[selectedIdx].label}
                </span>
                <ChevronDown size={16} className={`shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>
            {open && pos && createPortal(
                <ul
                    ref={listRef}
                    id={listId}
                    role="listbox"
                    style={{ position: "fixed", ...pos }}
                    className="z-[9999] max-h-64 overflow-auto rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a] shadow-xl p-1"
                >
                    {opts.map((o, i) => (
                        <li
                            key={String(o.value)}
                            id={`${listId}-${i}`}
                            role="option"
                            aria-selected={i === selectedIdx}
                            onMouseEnter={() => setActive(i)}
                            onMouseDown={(e) => e.preventDefault()} // keep focus on the button
                            onClick={() => choose(i)}
                            className={`flex items-center justify-between gap-3 px-3 py-2 rounded-lg cursor-pointer text-sm ${
                                i === active ? "bg-purple-50 dark:bg-purple-500/15" : ""
                            } ${i === selectedIdx ? "text-purple-600 dark:text-purple-300 font-medium" : "text-gray-700 dark:text-gray-200"}`}
                        >
                            {o.label}
                            {i === selectedIdx && <Check size={14} />}
                        </li>
                    ))}
                </ul>,
                document.body
            )}
        </div>
    );
}
