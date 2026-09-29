import "./ModelSort.css";

import { useEffect, useRef, useState } from "react";

import { PageTitle } from "@/ui";

import { MODEL_SORTS_CONFIG, type ModelSortKey } from "../../modelSortsConfig";

interface ModelSortProps {
    value: ModelSortKey;
    onChange: (value: ModelSortKey) => void;
    // Hlavička na telefonu otevírá nabídku ikonou - otevření pak řídí ModelBrowser
    isOpen?: boolean;
    onOpenChange?: (isOpen: boolean) => void;
    // Na telefonu se tlačítko schová (nahrazuje ho ikona v hlavičce), nabídka zůstává ukotvená v liště
    className?: string;
}

/** Výběr řazení modelů nad výpisem. */
function ModelSort({ value, onChange, isOpen: controlledOpen, onOpenChange, className }: ModelSortProps) {

    const [uncontrolledOpen, setUncontrolledOpen] = useState(false);

    const isControlled = controlledOpen !== undefined;
    const isOpen = isControlled ? controlledOpen : uncontrolledOpen;

    const controlRef = useRef<HTMLDivElement>(null);
    // Na telefonu je nabídka celostránková, proto se hlídá i plocha celé stránky s řazením
    const sortRef = useRef<HTMLDivElement>(null);
    const closeRef = useRef<() => void>(() => {});
    // Na otevření z hlavičky (ikona na telefonu) se nesmí hned reagovat zavřením z pointerdown
    const ignoreOutsideCloseUntilRef = useRef(0);
    closeRef.current = () => {
        if (isControlled) {
            onOpenChange?.(false);
        } else {
            setUncontrolledOpen(false);
        }
    };

    const setIsOpen = (next: boolean | ((open: boolean) => boolean)): void => {
        const resolved = typeof next === "function" ? next(isOpen) : next;

        if (isControlled) {
            onOpenChange?.(resolved);
        } else {
            setUncontrolledOpen(resolved);
        }
    };

    const selectedSort = MODEL_SORTS_CONFIG.find(
        (sortOption) => sortOption.value === value
    ) ?? MODEL_SORTS_CONFIG[0];

    useEffect(() => {
        if (isOpen && isControlled) {
            ignoreOutsideCloseUntilRef.current = Date.now() + 350;
        }
    }, [isOpen, isControlled]);

    useEffect(() => {
        const handlePointerDown = (event: PointerEvent): void => {
            const target = event.target as Element;

            // Kliknutí na ikony v hlavičce řeší přepínač v ModelBrowseru, tady se nezavírá
            if (target.closest?.(".header__icon-button")) {
                return;
            }

            if (event.target === sortRef.current) {
                return;
            }

            if (!controlRef.current?.contains(event.target as Node)) {
                if (Date.now() < ignoreOutsideCloseUntilRef.current) {
                    return;
                }

                closeRef.current();
            }
        };

        const handleKeyDown = (event: KeyboardEvent): void => {
            if (event.key === "Escape") {
                closeRef.current();
            }
        };

        document.addEventListener("pointerdown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    const handleOptionClick = (sortKey: ModelSortKey): void => {
        onChange(sortKey);
        setIsOpen(false);
    };

    return (
        <div
            ref={sortRef}
            className={`model-sort${isOpen ? " model-sort--open" : ""}${className ? ` ${className}` : ""}`}
        >
            {isOpen && <PageTitle compact>Řazení</PageTitle>}

            <label
                className="model-sort__label"
                htmlFor="model-sort-select"
            >
                Seřadit:
            </label>

            <div
                ref={controlRef}
                className={`model-sort__control${isOpen ? " model-sort__control--open" : ""}`}
            >
                <button
                    id="model-sort-select"
                    type="button"
                    className="model-sort__select"
                    aria-haspopup="listbox"
                    aria-expanded={isOpen}
                    onClick={() => setIsOpen((open) => !open)}
                >
                    <span className="model-sort__value">{selectedSort.label}</span>

                    <span className="model-sort__button-label">Seřadit</span>

                    <span className="model-sort__chevron" aria-hidden="true" />
                </button>

                {isOpen && (
                    <div
                        className="model-sort__menu"
                        role="listbox"
                        aria-label="Možnosti řazení"
                    >
                        {MODEL_SORTS_CONFIG.map((sortOption) => (
                            <button
                                key={sortOption.value}
                                type="button"
                                role="option"
                                aria-selected={sortOption.value === value}
                                className={`model-sort__option${
                                    sortOption.value === value
                                        ? " model-sort__option--active"
                                        : ""
                                }`}
                                onClick={() => handleOptionClick(sortOption.value)}
                            >
                                <span>{sortOption.label}</span>
                                {sortOption.value === value && (
                                    <span className="model-sort__check" aria-hidden="true">
                                        ✓
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ModelSort;
