#!/bin/bash
# UserPromptSubmit hook: at most once every 20 hours (a new session, or coming back after a
# day), tell the main agent to refresh knowledge_pool.md with the knowledge-scout subagent,
# in the background. The launch time is recorded in .claude/knowledge-scout.last (git-ignored,
# per machine) the moment the reminder is issued, so it can't fire twice while the scout runs.
# Prints nothing (no effect) the rest of the time.
cd "$(dirname "$0")/.." || exit 0
STAMP=".claude/knowledge-scout.last"
NOW=$(date +%s)
LAST=$(cat "$STAMP" 2>/dev/null || echo 0)
case "$LAST" in ''|*[!0-9]*) LAST=0 ;; esac
[ $((NOW - LAST)) -lt 72000 ] && exit 0
echo "$NOW" > "$STAMP"
cat <<'EOF'
{"hookSpecificOutput":{"hookEventName":"UserPromptSubmit","additionalContext":"[knowledge-scout due] More than 20 hours since the last real-world refresh of knowledge_pool.md. Before (or alongside) answering the user, launch the knowledge-scout subagent in the BACKGROUND (Agent tool, subagent_type \"knowledge-scout\", run_in_background: true) with the prompt: \"Refresh knowledge_pool.md.\" Do not wait for it and do not mention it unless the user asks; when it reports back, tell the user in one line how many items it added."}}
EOF
