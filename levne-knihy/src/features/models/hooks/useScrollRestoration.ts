import { useEffect, useLayoutEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

import { readScrollPosition, saveScrollPosition } from "../utils/browserPageStorage";

/**
 * Uchovává pozici scrollu stránky u záznamu v historii prohlížeče,
 * důležité pro návrat z detailu modelu k prohlížení.
 */
function useScrollRestoration(isReady: boolean) {

    const location = useLocation();
    const locationKey = location.key;

    const restoredRef = useRef(false);

    // Prohlížeč by pozici obnovil hned při návratu, kdy ale obsah ještě není
    // načtený a stránka je příliš krátká - obnova se řídí až po vykreslení obsahu
    useEffect(() => {
        const previousRestoration = window.history.scrollRestoration;
        window.history.scrollRestoration = "manual";

        return () => {
            window.history.scrollRestoration = previousRestoration;
        };
    }, []);

    // Pozice se průběžně ukládá při scrollu. Při odchodu ze stránky se neukládá.
    useEffect(() => {
        let ticking = false;
        const handleScroll = (): void => {
            if (ticking) return;
            ticking = true;

            window.requestAnimationFrame(() => {
                ticking = false;
                saveScrollPosition(locationKey, window.scrollY);
            });
        };

        window.addEventListener("scroll", handleScroll, { passive: true });

        return () => window.removeEventListener("scroll", handleScroll);
    }, [locationKey]);

    // Pozice se obnoví, až je vykreslený obsah
    useLayoutEffect(() => {
        if (restoredRef.current || !isReady) return;
        restoredRef.current = true;

        const savedPosition = readScrollPosition(locationKey);

        if (savedPosition > 0) {
            window.scrollTo(0, savedPosition);
        }
    }, [isReady, locationKey]);
}

export default useScrollRestoration;
