/**
 * Denní plánovač doplňování chybějících textů.
 *
 * Bez nutnosti ručního spouštění npm run generate:content pravidelně (standardně
 * jednou denně) zařadí do fronty všechny modely, kterým chybí popisek nebo přehledy.
 * Zpracování už zajistí zpracovatel fronty, který server spouští při startu - plánovač
 * tedy jen doplní frontu a dál na nic nečeká.
 *
 * Hned po startu (typicky probuzení hostingu) se spustí první doplnění, aby se
 * neztratil čas, kdy byl server uspaný. Další běhy pak následují denně v nastavený
 * čas (CONTENT_SCHEDULE_HOUR:CONTENT_SCHEDULE_MINUTE v čase serveru).
 */

const {
    SUMMARY_ENABLED,
    CONTENT_SCHEDULE_ENABLED,
    CONTENT_SCHEDULE_HOUR,
    CONTENT_SCHEDULE_MINUTE,
    CONTENT_SCHEDULE_STARTUP_DELAY_MS,
} = require("../config/env");
const { enqueueMissingContent } = require("./contentBackfill");

/** Jedno doplnění: zařadí do fronty vše, co dosud chybí. */
async function runBackfill() {
    if (!SUMMARY_ENABLED) {
        return;
    }

    try {
        const { totalModels, enqueuedDescriptions, enqueuedInsights } = await enqueueMissingContent("all");

        console.log(
            `Automatické doplňování: z ${totalModels} modelů zařazeno ` +
            `${enqueuedDescriptions} popisků a ${enqueuedInsights} přehledů.`
        );
    } catch (error) {
        console.error("Automatické doplňování chybějících textů selhalo:", error);
    }
}

/** Kolik milisekund zbývá do příštího výskytu zadaného času. */
function msUntil(hour, minute) {
    const now = new Date();
    const target = new Date(now);

    target.setHours(hour, minute, 0, 0);

    if (target.getTime() <= now.getTime()) {
        target.setDate(target.getDate() + 1);
    }

    return target.getTime() - now.getTime();
}

let nextRunTimer = null;

/** Naplánuje další denní běh, po každém běhu se naplánuje znovu. */
function scheduleNextRun() {
    const delay = msUntil(CONTENT_SCHEDULE_HOUR, CONTENT_SCHEDULE_MINUTE);

    nextRunTimer = setTimeout(() => {
        runBackfill().finally(scheduleNextRun);
    }, delay);

    // Neudržuje proces při životě jen kvůli plánovači
    nextRunTimer.unref();
}

/** Spustí denní plánovač doplňování (neblokuje). */
function startContentScheduler() {
    if (!CONTENT_SCHEDULE_ENABLED) {
        console.log("Automatické doplňování textů je vypnuté (CONTENT_SCHEDULE_ENABLED=false).");

        return;
    }

    if (!SUMMARY_ENABLED) {
        console.log("Automatické doplňování textů je vypnuté (chybí SUMMARY_API_KEY).");

        return;
    }

    // První doplnění krátce po startu - hostingu, který se uspává, se tak
    // žádný chybějící obsah neztratí ani mezi denními běhy.
    const startupTimer = setTimeout(() => {
        runBackfill();
    }, CONTENT_SCHEDULE_STARTUP_DELAY_MS);

    startupTimer.unref();

    scheduleNextRun();

    const pad = (value) => String(value).padStart(2, "0");

    console.log(
        `Automatické doplňování textů běží ` +
        `(denně v ${pad(CONTENT_SCHEDULE_HOUR)}:${pad(CONTENT_SCHEDULE_MINUTE)} čase serveru).`
    );
}

module.exports = {
    startContentScheduler,
};