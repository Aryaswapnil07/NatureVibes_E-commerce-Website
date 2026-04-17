const MaterialSpinner = ({
  label = "Loading",
  caption = "Please wait a moment.",
  className = "",
}) => {
  const containerClassName = [
    "flex flex-col items-center justify-center gap-4 text-center",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={containerClassName} role="status" aria-live="polite">
      <div className="material-spinner" aria-hidden="true">
        <span className="material-spinner__arc material-spinner__arc--blue" />
        <span className="material-spinner__arc material-spinner__arc--red" />
        <span className="material-spinner__arc material-spinner__arc--yellow" />
        <span className="material-spinner__arc material-spinner__arc--green" />
      </div>

      <div className="space-y-1">
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        {caption ? (
          <p className="max-w-xs text-xs leading-5 text-gray-500">{caption}</p>
        ) : null}
      </div>
    </div>
  );
};

export default MaterialSpinner;
