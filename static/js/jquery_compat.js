// summernote 0.9.1 is its latest release and still calls jQuery.now() and
// jQuery.nodeName(), both removed in jQuery 4. Restores jQuery's own
// implementations. Must load immediately after jQuery, before any plugin.
jQuery.now = Date.now;

jQuery.nodeName = function (elem, name) {
  return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
};
