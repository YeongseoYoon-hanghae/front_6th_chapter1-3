/* eslint-disable react-refresh/only-export-components */
import { createContext, memo, type PropsWithChildren, useCallback, useContext, useMemo, useReducer } from "react";
import { createPortal } from "react-dom";
import { Toast } from "./Toast";
import { createActions, initialState, toastReducer, type ToastType } from "./toastReducer";
import { debounce } from "../../utils";

type ShowToast = (message: string, type: ToastType) => void;
type Hide = () => void;

const ToastStateContext = createContext<{
  message: string;
  type: ToastType;
}>(initialState);

const ToastCommandContext = createContext<{
  show: ShowToast;
  hide: Hide;
}>({ show: () => null, hide: () => null });

const DEFAULT_DELAY = 3000;

export const useToastCommand = () => {
  return useContext(ToastCommandContext);
};

export const useToastState = () => {
  return useContext(ToastStateContext);
};

export const ToastProvider = memo(({ children }: PropsWithChildren) => {
  const [state, dispatch] = useReducer(toastReducer, initialState);
  const { show, hide } = useMemo(() => createActions(dispatch), [dispatch]);
  const visible = state.message !== "";

  const hideAfter = useMemo(() => debounce(hide, DEFAULT_DELAY), [hide]);

  const showWithHide = useCallback<ShowToast>(
    (...args) => {
      show(...args);
      hideAfter();
    },
    [show, hideAfter],
  );

  const commandValue = useMemo(
    () => ({
      show: showWithHide,
      hide,
    }),
    [showWithHide, hide],
  );

  return (
    <ToastCommandContext.Provider value={commandValue}>
      <ToastStateContext.Provider value={state}>
        {children}
        {visible && createPortal(<Toast />, document.body)}
      </ToastStateContext.Provider>
    </ToastCommandContext.Provider>
  );
});
