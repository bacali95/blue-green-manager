import type { FC, PropsWithChildren } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';

export const TIME_OFFSET_COOKIE_NAME = 'time-offset:state';
export const TIME_OFFSET_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export type TimeOffsetContext = number;

export const TimeOffsetContext = createContext<TimeOffsetContext>(0);

export const TimeOffsetContextProvider: FC<PropsWithChildren<{ defaultValue?: number }>> = ({
  children,
  defaultValue = 0,
}) => {
  const [timeOffset, setTimeOffset] = useState(defaultValue);

  useEffect(() => {
    const newValue = new Date().getTimezoneOffset() * -1;

    setTimeOffset(newValue);

    // This sets the cookie to keep the sidebar state.
    document.cookie = `${TIME_OFFSET_COOKIE_NAME}=${newValue}; path=/; max-age=${TIME_OFFSET_COOKIE_MAX_AGE}`;
  }, [timeOffset]);

  return (
    <TimeOffsetContext.Provider value={typeof window === 'undefined' ? timeOffset : 0}>
      {children}
    </TimeOffsetContext.Provider>
  );
};

export function useTimeOffsetContext(): TimeOffsetContext {
  return useContext(TimeOffsetContext);
}
