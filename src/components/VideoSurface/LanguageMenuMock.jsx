import { forwardRef, useState } from "react";
import { Menu } from "@videojs/react";
import { CheckIcon } from "@videojs/react/icons";
import "./LanguageMenuMock.css";

const MOCK_AUDIO = [
  { id: "fr", label: "Français" },
  { id: "en", label: "English" },
  { id: "ja", label: "日本語 (version originale)" },
];

const MOCK_SUBTITLES = [
  { id: "off", label: "Désactivés" },
  { id: "fr", label: "Français" },
  { id: "en", label: "English" },
];

const SkinButton = forwardRef(function SkinButton(
  { className = "", children, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type="button"
      className={`media-button media-button--subtle media-button--icon ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
});

function TrackOptions({ options, value, onChange, label }) {
  return (
    <Menu.RadioGroup
      className="media-menu__group"
      label={label}
      value={value}
      onValueChange={onChange}
    >
      {options.map((option) => (
        <Menu.RadioItem
          key={option.id}
          className="media-menu__item"
          value={option.id}
        >
          <span>{option.label}</span>
          <Menu.ItemIndicator
            checked={value === option.id}
            forceMount
            className="media-menu__indicator"
          >
            <CheckIcon className="media-icon" />
          </Menu.ItemIndicator>
        </Menu.RadioItem>
      ))}
    </Menu.RadioGroup>
  );
}

export function LanguageMenuMock() {
  const [audioId, setAudioId] = useState("fr");
  const [subtitleId, setSubtitleId] = useState("off");

  const triggerLabel =
    MOCK_AUDIO.find((t) => t.id === audioId)?.label.slice(0, 2) ?? "—";

  return (
    <Menu.Root side="top" align="center">
      <Menu.Trigger
        className="media-button--language"
        render={
          <SkinButton aria-label="Audio et sous-titres">
            <span className="language-menu__trigger-label">{triggerLabel}</span>
            <span className="language-menu__trigger-badge">mock</span>
          </SkinButton>
        }
      />
      <Menu.Content className="media-surface media-popover media-menu media-menu--language">
        <TrackOptions
          label="Audio"
          options={MOCK_AUDIO}
          value={audioId}
          onChange={setAudioId}
        />
        <Menu.Separator className="media-menu__separator" />
        <TrackOptions
          label="Sous-titres"
          options={MOCK_SUBTITLES}
          value={subtitleId}
          onChange={setSubtitleId}
        />
        <Menu.Label className="media-menu__hint">
          Aperçu fictif — aucun changement sur la lecture.
        </Menu.Label>
      </Menu.Content>
    </Menu.Root>
  );
}
