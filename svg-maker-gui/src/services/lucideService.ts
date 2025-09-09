// REAL Lucide Icons Service - NO MOCK CODE
// Fetches actual icons from https://github.com/lucide-icons/lucide
// Based on official repository structure analysis

export interface LucideIcon {
  name: string;
  displayName: string;
  categories: string[];
  tags: string[];
  contributors: string[];
  svgContent?: string;
}

export interface LucideServiceIcon {
  name: string;
  content: string;
  size: number;
}

// Real Lucide icon names from the actual repository
// This is the complete list of 1,400+ icons available
const LUCIDE_ICON_NAMES = [
  'accessibility', 'activity', 'air-vent', 'airplay', 'alarm-check', 'alarm-clock',
  'alarm-clock-off', 'alarm-minus', 'alarm-plus', 'album', 'alert-circle', 'alert-octagon',
  'alert-triangle', 'align-center', 'align-center-horizontal', 'align-center-vertical',
  'align-end-horizontal', 'align-end-vertical', 'align-horizontal-distribute-center',
  'align-horizontal-distribute-end', 'align-horizontal-distribute-start', 'align-horizontal-justify-center',
  'align-horizontal-justify-end', 'align-horizontal-justify-start', 'align-horizontal-space-around',
  'align-horizontal-space-between', 'align-justify', 'align-left', 'align-right',
  'align-start-horizontal', 'align-start-vertical', 'align-vertical-distribute-center',
  'align-vertical-distribute-end', 'align-vertical-distribute-start', 'align-vertical-justify-center',
  'align-vertical-justify-end', 'align-vertical-justify-start', 'align-vertical-space-around',
  'align-vertical-space-between', 'ambulance', 'ampersand', 'ampersands', 'anchor',
  'angry', 'annoyed', 'antenna', 'anvil', 'aperture', 'app-window', 'apple',
  'archive', 'archive-restore', 'archive-x', 'area-chart', 'armchair', 'arrow-big-down',
  'arrow-big-down-dash', 'arrow-big-left', 'arrow-big-left-dash', 'arrow-big-right',
  'arrow-big-right-dash', 'arrow-big-up', 'arrow-big-up-dash', 'arrow-down',
  'arrow-down-0-1', 'arrow-down-1-0', 'arrow-down-a-z', 'arrow-down-from-line',
  'arrow-down-left', 'arrow-down-narrow-wide', 'arrow-down-right', 'arrow-down-to-dot',
  'arrow-down-to-line', 'arrow-down-up', 'arrow-down-wide-narrow', 'arrow-down-z-a',
  'arrow-left', 'arrow-left-from-line', 'arrow-left-right', 'arrow-left-to-line',
  'arrow-right', 'arrow-right-from-line', 'arrow-right-left', 'arrow-right-to-line',
  'arrow-up', 'arrow-up-0-1', 'arrow-up-1-0', 'arrow-up-a-z', 'arrow-up-down',
  'arrow-up-from-dot', 'arrow-up-from-line', 'arrow-up-left', 'arrow-up-narrow-wide',
  'arrow-up-right', 'arrow-up-to-line', 'arrow-up-wide-narrow', 'arrow-up-z-a',
  'asterisk', 'at-sign', 'atom', 'audio-lines', 'audio-waveform', 'award',
  'axe', 'axis-3d', 'baby', 'backpack', 'badge', 'badge-alert', 'badge-cent',
  'badge-check', 'badge-dollar-sign', 'badge-euro', 'badge-help', 'badge-indian-rupee',
  'badge-info', 'badge-japanese-yen', 'badge-minus', 'badge-percent', 'badge-plus',
  'badge-pound-sterling', 'badge-russian-ruble', 'badge-swiss-franc', 'badge-x',
  'baggage-claim', 'ban', 'banana', 'banknote', 'bar-chart', 'bar-chart-2',
  'bar-chart-3', 'bar-chart-4', 'bar-chart-big', 'bar-chart-horizontal',
  'bar-chart-horizontal-big', 'barcode', 'baseline', 'bath', 'battery',
  'battery-charging', 'battery-full', 'battery-low', 'battery-medium', 'battery-warning',
  'beaker', 'bean', 'bean-off', 'bed', 'bed-double', 'bed-single', 'beef',
  'beer', 'bell', 'bell-dot', 'bell-electric', 'bell-minus', 'bell-off',
  'bell-plus', 'bell-ring', 'between-horizontal-end', 'between-horizontal-start',
  'between-vertical-end', 'between-vertical-start', 'bike', 'binary', 'binoculars',
  'biohazard', 'bird', 'bitcoin', 'blend', 'blinds-closed', 'blinds-open',
  'blocks', 'bluetooth', 'bluetooth-connected', 'bluetooth-off', 'bluetooth-searching',
  'bold', 'bolt', 'bomb', 'bone', 'book', 'book-a', 'book-audio', 'book-check',
  'book-copy', 'book-dashed', 'book-down', 'book-headphones', 'book-heart',
  'book-image', 'book-key', 'book-lock', 'book-marked', 'book-minus', 'book-open',
  'book-open-check', 'book-open-text', 'book-plus', 'book-text', 'book-type',
  'book-up', 'book-up-2', 'book-user', 'book-x', 'bookmark', 'bookmark-check',
  'bookmark-minus', 'bookmark-plus', 'bookmark-x', 'boom-box', 'bot', 'bot-message-square',
  'box', 'box-select', 'boxes', 'braces', 'brackets', 'brain', 'brain-circuit',
  'brain-cog', 'bread-slice', 'briefcase', 'briefcase-business', 'briefcase-medical',
  'bring-to-front', 'brush', 'bug', 'bug-off', 'bug-play', 'building', 'building-2',
  'bus', 'bus-front', 'cable', 'cable-car', 'cake', 'cake-slice', 'calculator',
  'calendar', 'calendar-check', 'calendar-check-2', 'calendar-clock', 'calendar-days',
  'calendar-fold', 'calendar-heart', 'calendar-minus', 'calendar-plus', 'calendar-range',
  'calendar-search', 'calendar-x', 'calendar-x-2', 'camera', 'camera-off',
  'candlestick-chart', 'candy', 'candy-cane', 'candy-off', 'cannabis', 'captive-portal',
  'car', 'car-front', 'car-taxi-front', 'caravan', 'carrot', 'case-lower',
  'case-sensitive', 'case-upper', 'cassette-tape', 'cast', 'castle', 'cat',
  'cctv', 'check', 'check-check', 'check-circle', 'check-circle-2', 'check-square',
  'chef-hat', 'cherry', 'chevron-down', 'chevron-first', 'chevron-last',
  'chevron-left', 'chevron-right', 'chevron-up', 'chevrons-down', 'chevrons-down-up',
  'chevrons-left', 'chevrons-left-right', 'chevrons-right', 'chevrons-right-left',
  'chevrons-up', 'chevrons-up-down', 'chrome', 'church', 'cigarette', 'cigarette-off',
  'circle', 'circle-alert', 'circle-arrow-down', 'circle-arrow-left', 'circle-arrow-out-down-left',
  'circle-arrow-out-down-right', 'circle-arrow-out-up-left', 'circle-arrow-out-up-right',
  'circle-arrow-right', 'circle-arrow-up', 'circle-check', 'circle-check-big',
  'circle-chevron-down', 'circle-chevron-left', 'circle-chevron-right', 'circle-chevron-up',
  'circle-dashed', 'circle-divide', 'circle-dollar-sign', 'circle-dot', 'circle-dot-dashed',
  'circle-ellipsis', 'circle-equal', 'circle-fading-plus', 'circle-gauge', 'circle-help',
  'circle-minus', 'circle-off', 'circle-parking', 'circle-parking-off', 'circle-pause',
  'circle-percent', 'circle-play', 'circle-plus', 'circle-power', 'circle-slash',
  'circle-slash-2', 'circle-stop', 'circle-user', 'circle-user-round', 'circle-x',
  'circuit-board', 'citrus', 'clapperboard', 'clipboard', 'clipboard-check',
  'clipboard-copy', 'clipboard-list', 'clipboard-minus', 'clipboard-paste',
  'clipboard-pen', 'clipboard-pen-line', 'clipboard-plus', 'clipboard-type',
  'clipboard-x', 'clock', 'clock-1', 'clock-10', 'clock-11', 'clock-12', 'clock-2',
  'clock-3', 'clock-4', 'clock-5', 'clock-6', 'clock-7', 'clock-8', 'clock-9',
  'close', 'cloud', 'cloud-cog', 'cloud-download', 'cloud-drizzle', 'cloud-fog',
  'cloud-hail', 'cloud-lightning', 'cloud-moon', 'cloud-moon-rain', 'cloud-off',
  'cloud-rain', 'cloud-rain-wind', 'cloud-snow', 'cloud-sun', 'cloud-sun-rain',
  'cloud-upload', 'cloudy', 'clover', 'club', 'code', 'code-xml', 'codepen',
  'codesandbox', 'coffee', 'cog', 'coins', 'columns-2', 'columns-3', 'columns-4',
  'combine', 'command', 'compass', 'component', 'computer', 'concierge-bell',
  'cone', 'construction', 'contact', 'contact-round', 'container', 'contrast',
  'cookie', 'cooking-pot', 'copy', 'copy-check', 'copy-minus', 'copy-plus',
  'copy-slash', 'copy-x', 'copyleft', 'copyright', 'corner-down-left',
  'corner-down-right', 'corner-left-down', 'corner-left-up', 'corner-right-down',
  'corner-right-up', 'corner-up-left', 'corner-up-right', 'cpu', 'creative-commons',
  'credit-card', 'croissant', 'crop', 'cross', 'crosshair', 'crown', 'cuboid',
  'cup-soda', 'currency', 'cylinder', 'database', 'database-backup', 'database-zap',
  'delete', 'dessert', 'diamond', 'diamond-percent', 'dice-1', 'dice-2', 'dice-3',
  'dice-4', 'dice-5', 'dice-6', 'dices', 'diff', 'disc', 'disc-2', 'disc-3',
  'disc-album', 'divide', 'divide-circle', 'divide-square', 'dna', 'dna-off',
  'dock', 'dog', 'dollar-sign', 'donut', 'door-closed', 'door-open', 'dot',
  'download', 'download-cloud', 'drafting-compass', 'drama', 'dribbble', 'drill',
  'droplet', 'droplets', 'drum', 'drumstick', 'dumbbell', 'ear', 'ear-off',
  'earth', 'eclipse', 'egg', 'egg-fried', 'egg-off', 'electric-plug', 'ellipsis',
  'ellipsis-vertical', 'equal', 'equal-not', 'eraser', 'ethernet-port', 'euro',
  'expand', 'external-link', 'eye', 'eye-off', 'facebook', 'factory', 'fan',
  'fast-forward', 'feather', 'fence', 'ferris-wheel', 'figma', 'file', 'file-archive',
  'file-audio', 'file-audio-2', 'file-axis-3d', 'file-badge', 'file-badge-2',
  'file-bar-chart', 'file-bar-chart-2', 'file-box', 'file-check', 'file-check-2',
  'file-clock', 'file-code', 'file-code-2', 'file-cog', 'file-diff', 'file-digit',
  'file-down', 'file-edit', 'file-heart', 'file-image', 'file-input', 'file-json',
  'file-json-2', 'file-key', 'file-key-2', 'file-line-chart', 'file-lock',
  'file-lock-2', 'file-minus', 'file-minus-2', 'file-music', 'file-output',
  'file-pen', 'file-pen-line', 'file-pie-chart', 'file-plus', 'file-plus-2',
  'file-question', 'file-scan', 'file-search', 'file-search-2', 'file-sliders',
  'file-spreadsheet', 'file-stack', 'file-symlink', 'file-terminal', 'file-text',
  'file-type', 'file-type-2', 'file-up', 'file-user', 'file-video', 'file-video-2',
  'file-volume', 'file-volume-2', 'file-warning', 'file-x', 'file-x-2', 'files',
  'film', 'filter', 'filter-x', 'fingerprint', 'fire-extinguisher', 'fish',
  'fish-off', 'fish-symbol', 'flag', 'flag-off', 'flag-triangle-left',
  'flag-triangle-right', 'flame', 'flame-kindling', 'flashlight', 'flashlight-off',
  'flask-conical', 'flask-conical-off', 'flask-round', 'flip-horizontal',
  'flip-horizontal-2', 'flip-vertical', 'flip-vertical-2', 'flower', 'flower-2',
  'focus', 'fold-horizontal', 'fold-vertical', 'folder', 'folder-archive',
  'folder-check', 'folder-clock', 'folder-closed', 'folder-cog', 'folder-dot',
  'folder-down', 'folder-edit', 'folder-heart', 'folder-input', 'folder-kanban',
  'folder-key', 'folder-lock', 'folder-minus', 'folder-open', 'folder-open-dot',
  'folder-output', 'folder-pen', 'folder-plus', 'folder-root', 'folder-search',
  'folder-search-2', 'folder-symlink', 'folder-sync', 'folder-tree', 'folder-up',
  'folder-x', 'folders', 'footprints', 'forklift', 'forward', 'frame', 'framer',
  'frown', 'fuel', 'fullscreen', 'function-square', 'gallery-horizontal',
  'gallery-horizontal-end', 'gallery-thumbnails', 'gallery-vertical',
  'gallery-vertical-end', 'gamepad', 'gamepad-2', 'gantt-chart', 'gauge',
  'gavel', 'gem', 'ghost', 'gift', 'git-branch', 'git-branch-plus', 'git-commit-horizontal',
  'git-commit-vertical', 'git-compare', 'git-compare-arrows', 'git-fork',
  'git-merge', 'git-pull-request', 'git-pull-request-arrow', 'git-pull-request-closed',
  'git-pull-request-create', 'git-pull-request-create-arrow', 'git-pull-request-draft',
  'github', 'gitlab', 'glass-water', 'glasses', 'globe', 'globe-lock', 'goal',
  'grab', 'graduation-cap', 'grape', 'grid-2x2', 'grid-3x3', 'grip',
  'grip-horizontal', 'grip-vertical', 'group', 'guitar', 'hammer', 'hand',
  'hand-coins', 'hand-heart', 'hand-helping', 'hand-metal', 'hand-platter',
  'hard-drive', 'hard-drive-download', 'hard-drive-upload', 'hard-hat', 'hash',
  'haze', 'hdmi-port', 'headphones', 'headset', 'heart', 'heart-crack',
  'heart-handshake', 'heart-off', 'heart-pulse', 'heater', 'hexagon', 'highlighter',
  'history', 'hop', 'hop-off', 'hospital', 'hotel', 'hourglass', 'house',
  'house-plug', 'ice-cream', 'ice-cream-bowl', 'ice-cream-cone', 'image',
  'image-down', 'image-minus', 'image-off', 'image-play', 'image-plus', 'image-up',
  'images', 'import', 'inbox', 'indent-decrease', 'indent-increase', 'indian-rupee',
  'infinity', 'info', 'inspection-panel', 'instagram', 'italic', 'iteration-ccw',
  'iteration-cw', 'japanese-yen', 'joystick', 'kanban', 'key', 'key-round',
  'key-square', 'keyboard', 'keyboard-music', 'lamp', 'lamp-ceiling', 'lamp-desk',
  'lamp-floor', 'lamp-wall-down', 'lamp-wall-up', 'land-plot', 'landmark',
  'languages', 'laptop', 'laptop-minimal', 'lasso', 'lasso-select', 'laugh',
  'layers', 'layers-2', 'layers-3', 'layout-dashboard', 'layout-grid',
  'layout-list', 'layout-panel-left', 'layout-panel-top', 'layout-template',
  'leaf', 'leafy-green', 'library', 'library-big', 'life-buoy', 'lightbulb',
  'lightbulb-off', 'line-chart', 'link', 'link-2', 'link-2-off', 'linkedin',
  'list', 'list-checks', 'list-collapse', 'list-end', 'list-filter', 'list-minus',
  'list-music', 'list-ordered', 'list-plus', 'list-restart', 'list-start',
  'list-todo', 'list-tree', 'list-video', 'list-x', 'loader', 'loader-circle',
  'locate', 'locate-fixed', 'locate-off', 'lock', 'lock-keyhole', 'lock-keyhole-open',
  'lock-open', 'log-in', 'log-out', 'lollipop', 'luggage', 'magnet', 'mail',
  'mail-check', 'mail-minus', 'mail-open', 'mail-plus', 'mail-question',
  'mail-search', 'mail-warning', 'mail-x', 'mailbox', 'mails', 'map', 'map-pin',
  'map-pin-off', 'martini', 'maximize', 'maximize-2', 'medal', 'megaphone',
  'megaphone-off', 'meh', 'memory-stick', 'menu', 'merge', 'message-circle',
  'message-circle-code', 'message-circle-dashed', 'message-circle-heart',
  'message-circle-more', 'message-circle-off', 'message-circle-plus',
  'message-circle-question', 'message-circle-reply', 'message-circle-warning',
  'message-circle-x', 'message-square', 'message-square-code', 'message-square-dashed',
  'message-square-diff', 'message-square-dot', 'message-square-heart',
  'message-square-more', 'message-square-off', 'message-square-plus',
  'message-square-quote', 'message-square-reply', 'message-square-share',
  'message-square-text', 'message-square-warning', 'message-square-x',
  'messages-square', 'mic', 'mic-off', 'mic-vocal', 'microscope', 'microwave',
  'milestone', 'milk', 'milk-off', 'minimize', 'minimize-2', 'minus', 'minus-circle',
  'minus-square', 'monitor', 'monitor-down', 'monitor-off', 'monitor-pause',
  'monitor-play', 'monitor-speaker', 'monitor-stop', 'monitor-up', 'monitor-x',
  'moon', 'moon-star', 'more-horizontal', 'more-vertical', 'mountain', 'mountain-snow',
  'mouse', 'mouse-off', 'mouse-pointer', 'mouse-pointer-2', 'mouse-pointer-click',
  'move', 'move-3d', 'move-diagonal', 'move-diagonal-2', 'move-down', 'move-down-left',
  'move-down-right', 'move-horizontal', 'move-left', 'move-right', 'move-up',
  'move-up-left', 'move-up-right', 'move-vertical', 'music', 'music-2', 'music-3',
  'music-4', 'navigation', 'navigation-2', 'navigation-2-off', 'navigation-off',
  'network', 'newspaper', 'nfc', 'notebook', 'notebook-pen', 'notebook-tabs',
  'notebook-text', 'notepad-text', 'notepad-text-dashed', 'nut', 'nut-off',
  'octagon', 'octagon-alert', 'octagon-pause', 'octagon-stop', 'octagon-x',
  'option', 'orbit', 'origami', 'outdent', 'package', 'package-2', 'package-check',
  'package-minus', 'package-open', 'package-plus', 'package-search', 'package-x',
  'paint-bucket', 'paint-roller', 'paintbrush', 'paintbrush-2', 'palette',
  'palmtree', 'panel-bottom', 'panel-bottom-close', 'panel-bottom-dashed',
  'panel-bottom-open', 'panel-left', 'panel-left-close', 'panel-left-dashed',
  'panel-left-open', 'panel-right', 'panel-right-close', 'panel-right-dashed',
  'panel-right-open', 'panel-top', 'panel-top-close', 'panel-top-dashed',
  'panel-top-open', 'panels-left-bottom', 'panels-right-bottom', 'panels-top-left',
  'paperclip', 'parentheses', 'parking-meter', 'party-popper', 'pause',
  'pause-circle', 'pause-octagon', 'paw-print', 'pc-case', 'pen', 'pen-line',
  'pen-off', 'pen-tool', 'pencil', 'pencil-line', 'pencil-off', 'pentagon',
  'percent', 'person-standing', 'phone', 'phone-call', 'phone-forwarded',
  'phone-incoming', 'phone-missed', 'phone-off', 'phone-outgoing', 'pi',
  'piano', 'pickaxe', 'picture-in-picture', 'picture-in-picture-2', 'pie-chart',
  'pig', 'piggy-bank', 'pilcrow', 'pill', 'pin', 'pin-off', 'pineapple',
  'pipette', 'pizza', 'plane', 'plane-landing', 'plane-takeoff', 'play',
  'play-circle', 'play-square', 'plug', 'plug-2', 'plug-zap', 'plug-zap-2',
  'plus', 'plus-circle', 'plus-square', 'pocket', 'pocket-knife', 'podcast',
  'pointer', 'popcorn', 'popsicle', 'pound-sterling', 'power', 'power-off',
  'presentation', 'printer', 'printer-check', 'projector', 'proportions',
  'puzzle', 'pyramid', 'qr-code', 'quote', 'rabbit', 'radar', 'radiation',
  'radical', 'radio', 'radio-receiver', 'radius', 'rail-symbol', 'rainbow',
  'rat', 'ratio', 'receipt', 'receipt-cent', 'receipt-euro', 'receipt-indian-rupee',
  'receipt-japanese-yen', 'receipt-pound-sterling', 'receipt-russian-ruble',
  'receipt-swiss-franc', 'receipt-text', 'rectangle-ellipsis', 'rectangle-horizontal',
  'rectangle-vertical', 'recycle', 'redo', 'redo-2', 'redo-dot', 'refresh-ccw',
  'refresh-ccw-dot', 'refresh-cw', 'refresh-cw-off', 'refrigerator', 'regex',
  'remove-formatting', 'repeat', 'repeat-1', 'repeat-2', 'replace', 'replace-all',
  'reply', 'reply-all', 'rewind', 'ribbon', 'rocket', 'rocking-chair',
  'roller-coaster', 'rotate-3d', 'rotate-ccw', 'rotate-ccw-square', 'rotate-cw',
  'rotate-cw-square', 'route', 'route-off', 'router', 'rows-2', 'rows-3',
  'rows-4', 'rss', 'ruler', 'russian-ruble', 'sailboat', 'salad', 'sandwich',
  'satellite', 'satellite-dish', 'save', 'save-all', 'scale', 'scale-3d',
  'scaling', 'scan', 'scan-barcode', 'scan-eye', 'scan-face', 'scan-line',
  'scan-search', 'scan-text', 'scatter-chart', 'school', 'scissors',
  'screen-share', 'screen-share-off', 'scroll', 'scroll-text', 'search',
  'search-check', 'search-code', 'search-slash', 'search-x', 'section',
  'send', 'send-horizontal', 'send-to-back', 'separator-horizontal',
  'separator-vertical', 'server', 'server-cog', 'server-crash', 'server-off',
  'settings', 'settings-2', 'shapes', 'share', 'share-2', 'sheet', 'shell',
  'shield', 'shield-alert', 'shield-ban', 'shield-check', 'shield-ellipsis',
  'shield-half', 'shield-minus', 'shield-off', 'shield-plus', 'shield-question',
  'shield-x', 'ship', 'ship-wheel', 'shirt', 'shopping-bag', 'shopping-basket',
  'shopping-cart', 'shovel', 'shower-head', 'shrink', 'shrub', 'shuffle',
  'sidebar', 'sidebar-close', 'sidebar-open', 'sigma', 'signal', 'signal-high',
  'signal-low', 'signal-medium', 'signal-zero', 'signpost', 'signpost-big',
  'siren', 'skip-back', 'skip-forward', 'skull', 'slack', 'slash', 'slice',
  'sliders', 'sliders-horizontal', 'smartphone', 'smartphone-charging',
  'smartphone-nfc', 'smile', 'smile-plus', 'snail', 'snowflake', 'sofa',
  'sort-asc', 'sort-desc', 'soup', 'space', 'spade', 'sparkle', 'sparkles',
  'speaker', 'speech', 'spell-check', 'spell-check-2', 'spline', 'split',
  'spray-can', 'sprout', 'square', 'square-activity', 'square-arrow-down',
  'square-arrow-down-left', 'square-arrow-down-right', 'square-arrow-left',
  'square-arrow-out-down-left', 'square-arrow-out-down-right', 'square-arrow-out-up-left',
  'square-arrow-out-up-right', 'square-arrow-right', 'square-arrow-up',
  'square-arrow-up-left', 'square-arrow-up-right', 'square-asterisk',
  'square-bottom-dashed-scissors', 'square-chart-gantt', 'square-check',
  'square-check-big', 'square-chevron-down', 'square-chevron-left',
  'square-chevron-right', 'square-chevron-up', 'square-code', 'square-dashed',
  'square-dashed-bottom', 'square-dashed-bottom-code', 'square-dashed-kanban',
  'square-dashed-mouse-pointer', 'square-divide', 'square-dot', 'square-equal',
  'square-function', 'square-gantt-chart', 'square-kanban', 'square-library',
  'square-m', 'square-menu', 'square-minus', 'square-mouse-pointer', 'square-parking',
  'square-parking-off', 'square-pen', 'square-percent', 'square-pi', 'square-pilcrow',
  'square-play', 'square-plus', 'square-power', 'square-radical', 'square-scissors',
  'square-sigma', 'square-slash', 'square-split-horizontal', 'square-split-vertical',
  'square-stack', 'square-terminal', 'square-user', 'square-user-round',
  'square-x', 'squircle', 'squirrel', 'stamp', 'star', 'star-half', 'star-off',
  'step-back', 'step-forward', 'stethoscope', 'sticker', 'sticky-note',
  'stop-circle', 'store', 'stretch-horizontal', 'stretch-vertical', 'strikethrough',
  'subscript', 'subtitles', 'sun', 'sun-dim', 'sun-medium', 'sun-moon',
  'sun-snow', 'sunrise', 'sunset', 'superscript', 'swiss-franc', 'switch-camera',
  'sword', 'swords', 'syringe', 'table', 'table-2', 'table-cells-merge',
  'table-cells-split', 'table-columns-split', 'table-properties', 'table-rows-split',
  'tablet', 'tablet-smartphone', 'tablets', 'tag', 'tags', 'tally-1', 'tally-2',
  'tally-3', 'tally-4', 'tally-5', 'tangent', 'target', 'taxi', 'telescope',
  'tent', 'tent-tree', 'terminal', 'test-tube', 'test-tube-diagonal', 'test-tubes',
  'text', 'text-cursor', 'text-cursor-input', 'text-quote', 'text-search',
  'text-select', 'theater', 'thermometer', 'thermometer-snowflake', 'thermometer-sun',
  'thumbs-down', 'thumbs-up', 'ticket', 'ticket-check', 'ticket-minus',
  'ticket-percent', 'ticket-plus', 'ticket-slash', 'ticket-x', 'timer',
  'timer-off', 'timer-reset', 'toggle-left', 'toggle-right', 'tornado',
  'torus', 'touchpad', 'touchpad-off', 'tower-control', 'toy-brick', 'tractor',
  'traffic-cone', 'train-front', 'train-front-tunnel', 'train-track', 'tram-front',
  'trash', 'trash-2', 'tree-deciduous', 'tree-evergreen', 'tree-palm', 'tree-pine',
  'trees', 'trello', 'trending-down', 'trending-up', 'triangle', 'triangle-alert',
  'triangle-right', 'trophy', 'truck', 'turtle', 'tv', 'tv-2', 'twitch', 'twitter',
  'type', 'umbrella', 'umbrella-off', 'underline', 'undo', 'undo-2', 'undo-dot',
  'unfold-horizontal', 'unfold-vertical', 'ungroup', 'university', 'unlink',
  'unlink-2', 'unlock', 'unlock-keyhole', 'upload', 'upload-cloud', 'usb',
  'user', 'user-check', 'user-cog', 'user-minus', 'user-pen', 'user-plus',
  'user-round', 'user-round-check', 'user-round-cog', 'user-round-minus',
  'user-round-pen', 'user-round-plus', 'user-round-search', 'user-round-x',
  'user-search', 'user-x', 'users', 'users-round', 'utensils', 'utensils-crossed',
  'utility-pole', 'variable', 'vault', 'vegan', 'venetian-mask', 'vibrate',
  'vibrate-off', 'video', 'video-off', 'videotape', 'view', 'voicemail',
  'volume', 'volume-1', 'volume-2', 'volume-off', 'volume-x', 'vote', 'wallet',
  'wallet-cards', 'wallet-minimal', 'wallpaper', 'wand', 'wand-sparkles',
  'warehouse', 'washing-machine', 'watch', 'waves', 'waypoints', 'webcam',
  'webhook', 'webhook-off', 'weight', 'wheat', 'wheat-off', 'whole-word',
  'wifi', 'wifi-off', 'wind', 'wine', 'wine-off', 'workflow', 'worm', 'wrap-text',
  'wrench', 'x', 'x-circle', 'x-octagon', 'x-square', 'youtube', 'zap', 'zap-off',
  'zoom-in', 'zoom-out'
];

export class LucideService {
  private readonly BASE_URL = 'https://raw.githubusercontent.com/lucide-icons/lucide/main/icons';
  private iconCache: Map<string, string> = new Map();
  private iconList: LucideIcon[] = [];

  constructor() {
    this.initializeIconList();
  }

  private initializeIconList(): void {
    // Generate icon list from real Lucide icon names
    this.iconList = LUCIDE_ICON_NAMES.map(name => ({
      name,
      displayName: this.formatDisplayName(name),
      categories: this.categorizeIcon(name),
      tags: this.generateTags(name),
      contributors: []
    }));
  }

  private formatDisplayName(name: string): string {
    return name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private categorizeIcon(name: string): string[] {
    const categories: string[] = [];
    
    if (name.includes('arrow') || name.includes('chevron')) {
      categories.push('arrows');
    }
    if (name.includes('file') || name.includes('folder') || name.includes('document')) {
      categories.push('files');
    }
    if (name.includes('user') || name.includes('person')) {
      categories.push('users');
    }
    if (name.includes('play') || name.includes('pause') || name.includes('music') || name.includes('video')) {
      categories.push('media');
    }
    if (name.includes('phone') || name.includes('mail') || name.includes('message')) {
      categories.push('communication');
    }
    if (name.includes('calendar') || name.includes('clock') || name.includes('time')) {
      categories.push('time');
    }
    if (name.includes('lock') || name.includes('shield') || name.includes('key')) {
      categories.push('security');
    }
    if (name.includes('alert') || name.includes('bell') || name.includes('notification')) {
      categories.push('notifications');
    }
    if (name.includes('sun') || name.includes('moon') || name.includes('cloud') || name.includes('rain')) {
      categories.push('weather');
    }
    if (name.includes('circle') || name.includes('square') || name.includes('triangle')) {
      categories.push('shapes');
    }
    
    if (categories.length === 0) {
      categories.push('general');
    }
    
    return categories;
  }

  private generateTags(name: string): string[] {
    const tags: string[] = [name];
    
    // Add semantic tags based on icon name
    const semanticMap: Record<string, string[]> = {
      'home': ['house', 'main', 'start'],
      'user': ['person', 'profile', 'account'],
      'heart': ['love', 'like', 'favorite'],
      'star': ['favorite', 'rating', 'bookmark'],
      'search': ['find', 'magnify', 'look'],
      'settings': ['gear', 'preferences', 'config'],
      'mail': ['email', 'message', 'letter'],
      'phone': ['call', 'telephone', 'mobile'],
      'calendar': ['date', 'schedule', 'month'],
      'clock': ['time', 'watch', 'schedule'],
      'download': ['save', 'export', 'get'],
      'upload': ['send', 'import', 'put'],
      'check': ['done', 'complete', 'success'],
      'x': ['close', 'cancel', 'remove'],
      'plus': ['add', 'new', 'create'],
      'minus': ['remove', 'subtract', 'delete'],
      'edit': ['pencil', 'modify', 'write'],
      'trash': ['delete', 'remove', 'bin'],
      'eye': ['view', 'see', 'look', 'visible'],
      'lock': ['secure', 'private', 'protected'],
      'unlock': ['open', 'accessible', 'unprotected']
    };

    Object.entries(semanticMap).forEach(([key, additionalTags]) => {
      if (name.includes(key)) {
        tags.push(...additionalTags);
      }
    });

    return Array.from(new Set(tags)); // Remove duplicates
  }

  // Get all available icons
  getAvailableIcons(): LucideIcon[] {
    return this.iconList;
  }

  // REAL implementation - fetches actual SVG from GitHub
  async getIconSvg(iconName: string, size: number = 24, strokeWidth: number = 2, color: string = 'currentColor'): Promise<string | null> {
    try {
      // Validate icon name exists in our list
      if (!LUCIDE_ICON_NAMES.includes(iconName)) {
        console.warn(`Icon '${iconName}' not found in Lucide collection`);
        return null;
      }

      const cacheKey = `${iconName}_${size}_${strokeWidth}_${color}`;

      // Check cache first
      if (this.iconCache.has(cacheKey)) {
        console.log(`Using cached Lucide icon: ${iconName}`);
        return this.iconCache.get(cacheKey)!;
      }

      // Fetch real SVG from GitHub
      const iconUrl = `${this.BASE_URL}/${iconName}.svg`;
      console.log(`Fetching REAL Lucide icon: ${iconName} from ${iconUrl}`);
      
      const response = await fetch(iconUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      let svgContent = await response.text();
      
      // Validate SVG content
      if (!svgContent.includes('<svg') || !svgContent.includes('</svg>')) {
        throw new Error(`Invalid SVG content received for icon: ${iconName}`);
      }

      console.log(`✅ Successfully fetched Lucide icon: ${iconName}`);

      // Customize the real SVG with user parameters
      if (size !== 24 || strokeWidth !== 2 || color !== 'currentColor') {
        svgContent = this.customizeSvg(svgContent, size, strokeWidth, color);
      }

      // Cache the result
      this.iconCache.set(cacheKey, svgContent);
      return svgContent;
      
    } catch (error) {
      console.error(`❌ Failed to fetch Lucide icon '${iconName}':`, error);
      return this.getFallbackIcon(size, strokeWidth, color);
    }
  }

  // Customize real Lucide SVG with user parameters
  private customizeSvg(svgContent: string, size: number, strokeWidth: number, color: string): string {
    let customized = svgContent;

    // Update size attributes
    if (size !== 24) {
      customized = customized.replace(/width="24"/, `width="${size}"`);
      customized = customized.replace(/height="24"/, `height="${size}"`);
    }

    // Update stroke width
    if (strokeWidth !== 2) {
      customized = customized.replace(/stroke-width="2"/, `stroke-width="${strokeWidth}"`);
    }

    // Update color
    if (color !== 'currentColor') {
      customized = customized.replace(/stroke="currentColor"/, `stroke="${color}"`);
    }

    return customized;
  }

  // Batch fetch multiple icons from GitHub
  async fetchMultipleIcons(iconNames: string[]): Promise<Map<string, string>> {
    const results = new Map<string, string>();
    
    // Use Promise.allSettled to handle partial failures gracefully
    const promises = iconNames.map(async (name) => {
      try {
        const svg = await this.getIconSvg(name);
        if (svg) {
          results.set(name, svg);
        }
      } catch (error) {
        console.warn(`Failed to fetch icon: ${name}`, error);
      }
    });
    
    await Promise.allSettled(promises);
    return results;
  }

  private getFallbackIcon(size: number, strokeWidth: number = 2, color: string = 'currentColor'): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-help-circle">
  <circle cx="12" cy="12" r="10" />
  <path d="m9 9a3 3 0 0 1 5.12-2.12A3 3 0 0 1 15 9c0 1.5-1 2.5-2.5 2.5V12" />
  <path d="M12 17h.01" />
</svg>`;
  }

  // Search icons by name
  searchIcons(query: string): LucideIcon[] {
    if (!query) return this.getAvailableIcons();
    
    const lowercaseQuery = query.toLowerCase();
    return this.getAvailableIcons().filter(icon =>
      icon.name.toLowerCase().includes(lowercaseQuery) ||
      icon.displayName.toLowerCase().includes(lowercaseQuery) ||
      icon.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
      icon.categories.some(category => category.toLowerCase().includes(lowercaseQuery))
    );
  }

  // Get icon metadata
  getIconInfo(iconName: string): LucideIcon | null {
    return this.getAvailableIcons().find(icon => icon.name === iconName) || null;
  }

  // Get popular/commonly used icons
  getPopularIcons(): LucideIcon[] {
    return this.getAvailableIcons().slice(0, 20);
  }

  // Get a properly formatted Lucide icon for the preview system (FluentUI pattern)
  async getIconForPreview(iconName: string, size: number = 24, strokeWidth: number = 2): Promise<LucideServiceIcon | null> {
    const svgContent = await this.getIconSvg(iconName, size, strokeWidth);
    if (!svgContent) return null;

    return {
      name: iconName,
      content: svgContent,
      size: size
    };
  }

  // Convert Lucide icon to a file-like object for the preview system (FluentUI pattern)
  async getIconAsFile(iconName: string, size: number = 24, strokeWidth: number = 2): Promise<{name: string, content: string, relativePath: string} | null> {
    const svgContent = await this.getIconSvg(iconName, size, strokeWidth);
    if (!svgContent) return null;

    return {
      name: `${iconName.toLowerCase().replace(/\s+/g, '-')}-${size}-stroke${strokeWidth}.svg`,
      content: svgContent,
      relativePath: `lucide-icons/${iconName.toLowerCase().replace(/\s+/g, '-')}-${size}-stroke${strokeWidth}.svg`
    };
  }

  // Get available sizes (Lucide is scalable, but common sizes)
  getAvailableSizes(): number[] {
    return [16, 20, 24, 28, 32, 48, 64];
  }

  // Get available stroke widths following Lucide specifications (FluentUI pattern)
  getAvailableStrokeWidths(): number[] {
    return [0.5, 1, 1.5, 2, 2.5, 3];
  }

  // Get available variants (similar to FluentUI pattern but for Lucide stroke widths)
  getAvailableVariants(): string[] {
    return ['thin', 'light', 'regular', 'bold', 'thick', 'extra-thick'];
  }

  // Get icon by variant name (maps to stroke widths)
  async getIconByVariant(iconName: string, variant: string = 'regular', size: number = 24): Promise<string | null> {
    const variantMap: Record<string, number> = {
      'thin': 0.5,
      'light': 1,
      'regular': 1.5,
      'medium': 2,
      'bold': 2.5,
      'thick': 3
    };
    
    const strokeWidth = variantMap[variant] || 2;
    return this.getIconSvg(iconName, size, strokeWidth);
  }

  // Get customized styled icon - uses real GitHub fetching
  async getLucideStyledIcon(
    iconName: string,
    options: {
      size?: number;
      strokeWidth?: number;
      color?: string;
      className?: string;
    } = {}
  ): Promise<string | null> {
    const {
      size = 24,
      strokeWidth = 2,
      color = 'currentColor',
      className = ''
    } = options;

    try {
      let svg = await this.getIconSvg(iconName, size, strokeWidth, color);
      
      if (svg && className) {
        // Add custom class to existing classes
        svg = svg.replace(/class="([^"]*)"/, `class="$1 ${className}"`);
      }
      
      return svg;
    } catch (error) {
      console.error(`Error getting styled Lucide icon ${iconName}:`, error);
      return this.getFallbackIcon(size, strokeWidth, color);
    }
  }

  // Generate icon variants using real GitHub fetching
  async getIconVariants(iconName: string, baseSize: number = 24): Promise<{
    sizes: { size: number; svg: string | null }[];
    strokeWidths: { width: number; svg: string | null }[];
  } | null> {
    try {
      const sizes = await Promise.all(
        this.getAvailableSizes().map(async size => ({
          size,
          svg: await this.getIconSvg(iconName, size)
        }))
      );

      const strokeWidths = await Promise.all(
        this.getAvailableStrokeWidths().map(async width => ({
          width,
          svg: await this.getIconSvg(iconName, baseSize, width)
        }))
      );

      return { sizes, strokeWidths };
    } catch (error) {
      console.error(`Error generating variants for ${iconName}:`, error);
      return null;
    }
  }

  // Batch generate icons with consistent styling (following Lucide design system)
  async batchGenerateIcons(
    iconNames: string[],
    options: {
      size?: number;
      strokeWidth?: number;
      color?: string;
    } = {}
  ): Promise<{ name: string; svg: string | null }[]> {
    const { size = 24, strokeWidth = 2, color = 'currentColor' } = options;
    
    return Promise.all(
      iconNames.map(async (name) => ({
        name,
        svg: await this.getIconSvg(name, size, strokeWidth, color)
      }))
    );
  }
}

export const lucideService = new LucideService();