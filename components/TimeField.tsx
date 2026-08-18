"use client";

import { useEffect, useMemo, useState } from "react";

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function toMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

function slots(min: string, max: string, step: number) {
  const start = toMinutes(min);
  let end = toMinutes(max);
  if (max === "00:00" || max === "23:59") end = 24 * 60 - step;
  const out: string[] = [];
  for (let t = Math.ceil(start / step) * step; t <= end && t < 24 * 60; t += step) {
    out.push(`${pad(Math.floor(t / 60))}:${pad(t % 60)}`);
  }
  return out;
}

const fieldClass = "w-full min-w-0 max-w-full rounded-xl border border-line bg-paper px-3 py-2 text-ink";
const selectClass = `time-select ${fieldClass} pr-7`;

export function TimeField({
  name,
  min = "11:00",
  max = "23:45",
  defaultValue,
  step = 15,
}: {
  name: string;
  min?: string;
  max?: string;
  defaultValue?: string;
  step?: number;
}) {
  const [desktop, setDesktop] = useState(false);
  const options = useMemo(() => slots(min, max, step), [min, max, step]);
  const fallback = options[0] ?? "12:00";
  const start = defaultValue && options.includes(defaultValue) ? defaultValue : fallback;
  const [value, setValue] = useState(start);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");
    const sync = () => setDesktop(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  const hour = value.slice(0, 2);
  const minute = value.slice(3, 5);
  const hourList = [...new Set(options.map((item) => item.slice(0, 2)))];
  const minuteList = options.filter((item) => item.startsWith(`${hour}:`)).map((item) => item.slice(3, 5));

  function setHour(nextHour: string) {
    const same = options.find((item) => item === `${nextHour}:${minute}`);
    const first = options.find((item) => item.startsWith(`${nextHour}:`));
    setValue(same ?? first ?? fallback);
  }

  if (!desktop) {
    return (
      <input
        required
        name={name}
        type="time"
        lang="ru"
        min={min}
        max={max === "00:00" ? "23:59" : max}
        defaultValue={start}
        className={fieldClass}
      />
    );
  }

  return (
    <div className="grid w-full min-w-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-1.5">
      <select
        required
        aria-label="Часы"
        value={hour}
        className={selectClass}
        onChange={(event) => setHour(event.target.value)}
      >
        {hourList.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
      <span className="text-ink-soft" aria-hidden>
        :
      </span>
      <select
        required
        aria-label="Минуты"
        value={minuteList.includes(minute) ? minute : minuteList[0]}
        className={selectClass}
        onChange={(event) => setValue(`${hour}:${event.target.value}`)}
      >
        {minuteList.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
      <input type="hidden" name={name} value={value} />
    </div>
  );
}
