import { useNavigate, useRouterState } from "@tanstack/react-router";
import { GroupSelect } from "@/components/group-select";

const OPTIONS = [
  { value: "/listen", label: "Vocabulary" },
  { value: "/listen/read/1", label: "Genesis 1" },
  { value: "/listen/read/2", label: "Genesis 2" },
  { value: "/listen/read/3", label: "Genesis 3" },
  { value: "/listen/read/4", label: "Genesis 4" },
  { value: "/listen/read/5", label: "Genesis 5" },
  { value: "/listen/read/all", label: "Genesis 1–5" },
];

export function ListenMenu() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const current = OPTIONS.find((o) => o.value === pathname)?.value ?? (pathname.startsWith("/listen/read") ? pathname : "/listen");

  return (
    <GroupSelect
      title="Listen"
      value={current}
      options={OPTIONS}
      onChange={(to) => {
        if (to === "/listen") void navigate({ to: "/listen" });
        else {
          const ch = to.replace("/listen/read/", "") || "1";
          void navigate({ to: "/listen/read/$ch", params: { ch } });
        }
      }}
    />
  );
}
