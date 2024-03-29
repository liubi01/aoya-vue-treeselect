<script>
import { MENU_BUFFER } from "../constants";
import {
  watchSize,
  setupResizeAndScrollEventListeners,
  hasScrollbar,
  getScrollbarWidth,
  debounce,
} from "../utils";
import Option from "./Option";
import Tip from "./Tip";

const directionMap = {
  top: "top",
  bottom: "bottom",
  above: "top",
  below: "bottom",
};

export default {
  name: "vue-treeselect--menu",
  inject: ["instance"],

  computed: {
    menuStyle() {
      const { instance } = this;

      return {
        maxHeight: `${instance.maxHeight}px`,
      };
    },

    menuContainerStyle() {
      const { instance } = this;

      return {
        zIndex: instance.appendToBody ? null : instance.zIndex,
      };
    },
  },

  watch: {
    "instance.menu.isOpen": function (newValue) {
      if (newValue) {
        // In case `openMenu()` is just called and the menu is not rendered yet.
        this.$nextTick(this.onMenuOpen);
      } else {
        this.onMenuClose();
      }
    },
  },

  created() {
    this.menuSizeWatcher = null;
    this.menuResizeAndScrollEventListeners = null;
    this.debouncedCallback = debounce(
      this.debounceAdjustMenuOpenDirection,
      200,
      {
        leading: true,
        trailing: true,
      }
    );
  },

  mounted() {
    const { instance } = this;

    if (instance.menu.isOpen) this.$nextTick(this.onMenuOpen);
  },

  destroyed() {
    this.onMenuClose();
  },

  methods: {
    renderMenu() {
      const { instance } = this;

      if (!instance.menu.isOpen) return null;

      return (
        <div
          ref="menu"
          class="vue-treeselect__menu"
          onMousedown={instance.handleMouseDown}
          style={this.menuStyle}
        >
          {this.renderBeforeList()}
          {instance.async
            ? this.renderAsyncSearchMenuInner()
            : instance.localSearch.active
            ? this.renderLocalSearchMenuInner()
            : this.renderNormalMenuInner()}
          {this.renderAfterList()}
        </div>
      );
    },

    renderBeforeList() {
      const { instance } = this;
      const beforeListRenderer = instance.$scopedSlots["before-list"];

      return beforeListRenderer ? beforeListRenderer() : null;
    },

    renderAfterList() {
      const { instance } = this;
      const afterListRenderer = instance.$scopedSlots["after-list"];

      return afterListRenderer ? afterListRenderer() : null;
    },

    renderNormalMenuInner() {
      const { instance } = this;

      if (instance.rootOptionsStates.isLoading) {
        return this.renderLoadingOptionsTip();
      }
      if (instance.rootOptionsStates.loadingError) {
        return this.renderLoadingRootOptionsErrorTip();
      }
      if (
        instance.rootOptionsStates.isLoaded &&
        instance.forest.normalizedOptions.length === 0
      ) {
        return this.renderNoAvailableOptionsTip();
      }
      return this.renderOptionList();
    },

    renderLocalSearchMenuInner() {
      const { instance } = this;

      if (instance.rootOptionsStates.isLoading) {
        return this.renderLoadingOptionsTip();
      }
      if (instance.rootOptionsStates.loadingError) {
        return this.renderLoadingRootOptionsErrorTip();
      }
      if (
        instance.rootOptionsStates.isLoaded &&
        instance.forest.normalizedOptions.length === 0
      ) {
        return this.renderNoAvailableOptionsTip();
      }
      if (instance.localSearch.noResults) {
        return this.renderNoResultsTip();
      }
      return this.renderOptionList();
    },

    renderAsyncSearchMenuInner() {
      const { instance } = this;
      const entry = instance.getRemoteSearchEntry();
      const shouldShowSearchPromptTip =
        instance.trigger.searchQuery === "" && !instance.defaultOptions;
      const shouldShowNoResultsTip = shouldShowSearchPromptTip
        ? false
        : entry.isLoaded && entry.options.length === 0;

      if (shouldShowSearchPromptTip) {
        return this.renderSearchPromptTip();
      }
      if (entry.isLoading) {
        return this.renderLoadingOptionsTip();
      }
      if (entry.loadingError) {
        return this.renderAsyncSearchLoadingErrorTip();
      }
      if (shouldShowNoResultsTip) {
        return this.renderNoResultsTip();
      }
      return this.renderOptionList();
    },

    renderOptionList() {
      const { instance } = this;

      return (
        <div class="vue-treeselect__list">
          {instance.forest.normalizedOptions.map((rootNode) => (
            <Option node={rootNode} key={rootNode.id} />
          ))}
        </div>
      );
    },

    renderSearchPromptTip() {
      const { instance } = this;

      return (
        <Tip type="search-prompt" icon="warning">
          {instance.searchPromptText}
        </Tip>
      );
    },

    renderLoadingOptionsTip() {
      const { instance } = this;

      return (
        <Tip type="loading" icon="loader">
          {instance.loadingText}
        </Tip>
      );
    },

    renderLoadingRootOptionsErrorTip() {
      const { instance } = this;

      return (
        <Tip type="error" icon="error">
          {instance.rootOptionsStates.loadingError}
          <a
            class="vue-treeselect__retry"
            onClick={instance.loadRootOptions}
            title={instance.retryTitle}
          >
            {instance.retryText}
          </a>
        </Tip>
      );
    },

    renderAsyncSearchLoadingErrorTip() {
      const { instance } = this;
      const entry = instance.getRemoteSearchEntry();

      // TODO: retryTitle?

      return (
        <Tip type="error" icon="error">
          {entry.loadingError}
          <a
            class="vue-treeselect__retry"
            onClick={instance.handleRemoteSearch}
            title={instance.retryTitle}
          >
            {instance.retryText}
          </a>
        </Tip>
      );
    },

    renderNoAvailableOptionsTip() {
      const { instance } = this;

      return (
        <Tip type="no-options" icon="warning">
          {instance.noOptionsText}
        </Tip>
      );
    },

    renderNoResultsTip() {
      const { instance } = this;

      return (
        <Tip type="no-results" icon="warning">
          {instance.noResultsText}
        </Tip>
      );
    },

    onMenuOpen() {
      this.adjustMenuOpenDirection();
      this.setupMenuSizeWatcher();
      this.setupMenuResizeAndScrollEventListeners();
    },

    onMenuClose() {
      this.removeMenuSizeWatcher();
      this.removeMenuResizeAndScrollEventListeners();
    },

    adjustMenuOpenDirection() {
      this.debouncedCallback();
      // this.debounceAdjustMenuOpenDirection();
    },
    debounceAdjustMenuOpenDirection() {
      const { instance } = this;
      if (!instance.menu.isOpen) return;
      this.barWidth = hasScrollbar() ? getScrollbarWidth() : 0;
      const $menu = instance.getMenu();
      const $control = instance.getControl();
      const menuRect = $menu.getBoundingClientRect();
      const controlRect = $control.getBoundingClientRect();
      const menuHeight = menuRect.height;
      // const menuWidth = menuRect.width;
      // const menuLeft = menuRect.left;
      const menuRight = menuRect.right;
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const spaceAbove = controlRect.top;
      const spaceBelow = window.innerHeight - controlRect.bottom;
      const spaceRight = viewportWidth - menuRight;
      const isControlInViewport =
        (controlRect.top >= 0 && controlRect.top <= viewportHeight) ||
        (controlRect.top < 0 && controlRect.bottom > 0); // 上下距离判断是否在可视区域
      const hasEnoughSpaceBelow = spaceBelow > menuHeight + MENU_BUFFER;
      const hasEnoughSpaceAbove = spaceAbove > menuHeight + MENU_BUFFER;
      const hasEnoughSpaceRight = spaceRight >= this.barWidth; // 2为border
      // console.log(
      //   "spaceRight",
      //   viewportWidth,
      //   menuRight,
      //   spaceRight,
      //   this.barWidth,
      //   hasEnoughSpaceRight
      // );
      if (!isControlInViewport) {
        instance.closeMenu();
        return;
      }
      // 上下
      if (instance.openDirection !== "auto") {
        instance.menu.placement = directionMap[instance.openDirection];
      } else if (hasEnoughSpaceBelow || !hasEnoughSpaceAbove) {
        instance.menu.placement = "bottom";
      } else {
        instance.menu.placement = "top";
      }
      if (!hasEnoughSpaceRight) {
        // 右边溢出
        instance.menu.placementX = "right"; // 右边边对齐
        instance.menu.offsetX += spaceRight - this.barWidth; // 17纵向滚动条
        // instance.menu.oldOffsetX = instance.menu.offsetX; // 17纵向滚动条
        console.log("right", instance.menu.offsetX);
      } else {
        instance.menu.placementX = "left"; // 左边边对齐
        console.log("left", instance.menu.offsetX);
        // console.log(spaceRight >= 17 && instance.menu.offsetX);
        instance.menu.offsetX =
          spaceRight <= this.barWidth &&
          spaceRight >= 0 &&
          instance.menu.offsetX
            ? instance.menu.offsetX
            : 0; // 17纵向滚动条
      }
    },

    setupMenuSizeWatcher() {
      const { instance } = this;
      const $menu = instance.getMenu();

      // istanbul ignore next
      if (this.menuSizeWatcher) return;

      this.menuSizeWatcher = {
        remove: watchSize($menu, this.adjustMenuOpenDirection),
      };
    },

    setupMenuResizeAndScrollEventListeners() {
      const { instance } = this;
      const $control = instance.getControl();

      // istanbul ignore next
      if (this.menuResizeAndScrollEventListeners) return;

      this.menuResizeAndScrollEventListeners = {
        remove: setupResizeAndScrollEventListeners(
          $control,
          this.adjustMenuOpenDirection
        ),
      };
    },

    removeMenuSizeWatcher() {
      if (!this.menuSizeWatcher) return;

      this.menuSizeWatcher.remove();
      this.menuSizeWatcher = null;
    },

    removeMenuResizeAndScrollEventListeners() {
      if (!this.menuResizeAndScrollEventListeners) return;

      this.menuResizeAndScrollEventListeners.remove();
      this.menuResizeAndScrollEventListeners = null;
    },
  },

  render() {
    return (
      <div
        ref="menu-container"
        class="vue-treeselect__menu-container"
        style={this.menuContainerStyle}
      >
        <transition name="vue-treeselect__menu--transition">
          {this.renderMenu()}
        </transition>
      </div>
    );
  },
};
</script>
