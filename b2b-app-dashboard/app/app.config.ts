// app.config.ts
export default defineAppConfig({
  ui: {
    theme: {
      default: 'light',
      strategy: 'none'
    },

    page: {
      slots: {
        root: 'flex flex-col lg:grid lg:grid-cols-10 lg:gap-10 bg-white',
        center: 'lg:col-span-8'
      }
    },

    // Styl samego sidebaru (kontener, header/body/footer)
    dashboardSidebar: {
      slots: {
        root: 'relative hidden lg:flex flex-col min-h-svh min-w-16 w-(--width) shrink-0 bg-white',
        header: 'h-(--ui-header-height) shrink-0 flex items-center gap-1.5 px-4 bg-white',
        body: 'flex flex-col gap-4 flex-1 overflow-y-auto px-4 py-2',
        footer: 'shrink-0 flex items-center gap-1.5 px-4 py-2',
        toggle: '',
        handle: '',
        content: 'lg:hidden',
        overlay: 'lg:hidden'
      },
      variants: {
        menu: {
          true: { header: 'sm:px-6', body: 'sm:px-6', footer: 'sm:px-6' }
        },
        side: {
          left: { root: 'border-e border-default' },
          right: { root: '' }
        },
        toggleSide: {
          left: { toggle: '' },
          right: { toggle: 'ms-auto' }
        }
      }
    },

    // ✅ Właściwe miejsce na styl linków UNavigationMenu
    navigationMenu: {
      slots: {
        link: 'text-green-200 hover:bg-lime-200 hover:text-gray-800 ',
        linkLeadingIcon: 'size-5 shrink-0',
        linkLabel: 'truncate',
        linkTrailingBadge: 'text-xs',
        childItem: 'bg-white',
        childLink: 'group relative size-full flex items-start text-start text-sm before:absolute before:z-[-1] before:rounded-md focus:outline-none focus-visible:outline-none focus-visible:before:ring-inset focus-visible:before:ring-2'
      },
      variants: {
        orientation: {
          vertical: { link: 'px-3 py-2' }
        },
        color: {
          neutral: {
          }
        },
        disabled: {
          true: { link: 'bg-lime-200 opacity-60 cursor-not-allowed' }
        }
      }
    }
  }
})
