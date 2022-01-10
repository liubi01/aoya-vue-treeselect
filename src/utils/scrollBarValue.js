export function hasScrollbar() {
  return (
    document.body.scrollHeight >
    (window.innerHeight || document.documentElement.clientHeight)
  );
}

export function getScrollbarWidth() {
  const scrollDiv = document.createElement("div");
  scrollDiv.style.cssText =
    "width: 99px; height: 99px; overflow: scroll; position: absolute; top: -9999px;";
  document.body.appendChild(scrollDiv);
  const scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
  document.body.removeChild(scrollDiv);
  return scrollbarWidth;
}
