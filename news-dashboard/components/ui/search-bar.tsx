"use client"
import type React from "react"
import { useState, useRef, useEffect, useMemo, useId, useCallback } from "react"
import { Search, CircleDot } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

const GooeyFilter = ({ filterId }: { filterId: string }) => (
  <svg style={{ position: "absolute", width: 0, height: 0 }} aria-hidden="true">
    <defs>
      <filter id={filterId}>
        <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur" />
        <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -8" result="goo" />
        <feComposite in="SourceGraphic" in2="goo" operator="atop" />
      </filter>
    </defs>
  </svg>
)

interface SearchBarProps {
  placeholder?: string
  suggestions?: string[]
  onSearch?: (query: string) => void
}

const SearchBar = ({ placeholder = "Search news...", suggestions: externalSuggestions = [], onSearch }: SearchBarProps) => {
  const instanceId = useId()
  const filterId = `gooey-effect-${instanceId.replace(/:/g, '')}`
  const inputRef = useRef<HTMLInputElement>(null)
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const animatingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const clickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAnimating, setIsAnimating] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isClicked, setIsClicked] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  // Pre-compute stable random values for particles so they don't jump on re-render
  const particleSeeds = useMemo(() =>
    Array.from({ length: 18 }, () => ({
      x: (Math.random() - 0.5) * 40,
      y: (Math.random() - 0.5) * 40,
      scale: Math.random() * 0.8 + 0.4,
      duration: Math.random() * 1.5 + 1.5,
      left: Math.random() * 100,
      top: Math.random() * 100,
    })), []
  )

  const clickParticleSeeds = useMemo(() =>
    Array.from({ length: 14 }, () => ({
      dx: (Math.random() - 0.5) * 160,
      dy: (Math.random() - 0.5) * 160,
      scale: Math.random() * 0.8 + 0.2,
      duration: Math.random() * 0.8 + 0.5,
      r: 147 + Math.floor(Math.random() * 44),
      g: 180 + Math.floor(Math.random() * 65),
      b: 73 + Math.floor(Math.random() * 100),
    })), []
  )

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current)
      if (animatingTimeoutRef.current) clearTimeout(animatingTimeoutRef.current)
      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current)
    }
  }, [])

  const isUnsupportedBrowser = useMemo(() => {
    if (typeof window === "undefined") return false
    const ua = navigator.userAgent.toLowerCase()
    const isSafari = ua.includes("safari") && !ua.includes("chrome") && !ua.includes("chromium")
    const isChromeOniOS = ua.includes("crios")
    return isSafari || isChromeOniOS
  }, [])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    onSearch?.(value)
    if (value.trim() && externalSuggestions.length > 0) {
      const filtered = externalSuggestions.filter((item) => item.toLowerCase().includes(value.toLowerCase()))
      setSuggestions(filtered.slice(0, 6))
    } else {
      setSuggestions([])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery)
      setIsAnimating(true)
      if (animatingTimeoutRef.current) clearTimeout(animatingTimeoutRef.current)
      animatingTimeoutRef.current = setTimeout(() => setIsAnimating(false), 1000)
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isFocused) {
      const rect = e.currentTarget.getBoundingClientRect()
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
    setIsClicked(true)
    if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current)
    clickTimeoutRef.current = setTimeout(() => setIsClicked(false), 800)
  }

  useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isFocused])

  const searchIconVariants = {
    initial: { scale: 1 },
    animate: {
      rotate: isAnimating ? [0, -15, 15, -10, 10, 0] : 0,
      scale: isAnimating ? [1, 1.3, 1] : 1,
      transition: { duration: 0.6, ease: "easeInOut" as const },
    },
  }

  const suggestionVariants = {
    hidden: (i: number) => ({
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: { duration: 0.15, delay: i * 0.05 },
    }),
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring" as const, stiffness: 300, damping: 15, delay: i * 0.07 },
    }),
    exit: (i: number) => ({
      opacity: 0,
      y: -5,
      scale: 0.9,
      transition: { duration: 0.1, delay: i * 0.03 },
    }),
  }

  const particles = isFocused
    ? particleSeeds.map((seed, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0 }}
          animate={{
            x: [0, seed.x],
            y: [0, seed.y],
            scale: [0, seed.scale],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: seed.duration,
            ease: "easeInOut",
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
          className="absolute w-3 h-3 rounded-full bg-gradient-to-r from-[#93b44a] to-[#BFF549]"
          style={{
            left: `${seed.left}%`,
            top: `${seed.top}%`,
            filter: "blur(2px)",
          }}
        />
      ))
    : null

  const clickParticles = isClicked
    ? clickParticleSeeds.map((seed, i) => (
        <motion.div
          key={`click-${i}`}
          initial={{ x: mousePosition.x, y: mousePosition.y, scale: 0, opacity: 1 }}
          animate={{
            x: mousePosition.x + seed.dx,
            y: mousePosition.y + seed.dy,
            scale: seed.scale,
            opacity: [1, 0],
          }}
          transition={{ duration: seed.duration, ease: "easeOut" }}
          className="absolute w-3 h-3 rounded-full"
          style={{
            background: `rgba(${seed.r}, ${seed.g}, ${seed.b}, 0.8)`,
            boxShadow: "0 0 8px rgba(191, 245, 73, 0.8)",
          }}
        />
      ))
    : null

  return (
    <div className="relative w-full">
      <GooeyFilter filterId={filterId} />
      <motion.form
        onSubmit={handleSubmit}
        className="relative flex items-center justify-center w-full mx-auto"
        initial={{ width: "380px" }}
        animate={{ width: isFocused ? "520px" : "380px", scale: isFocused ? 1.05 : 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        onMouseMove={handleMouseMove}
      >
        <motion.div
          className={cn(
            "flex items-center w-full rounded-full border relative overflow-hidden backdrop-blur-md",
            isFocused ? "border-transparent shadow-xl" : "border-[#93b44a]/30 bg-white/5"
          )}
          animate={{
            boxShadow: isClicked
              ? "0 0 40px rgba(147, 180, 74, 0.5), 0 0 15px rgba(191, 245, 73, 0.7) inset"
              : isFocused
              ? "0 15px 35px rgba(0, 0, 0, 0.3)"
              : "0 0 0 rgba(0, 0, 0, 0)",
          }}
          onClick={handleClick}
        >
          {isFocused && (
            <motion.div
              className="absolute inset-0 -z-10"
              initial={{ opacity: 0 }}
              animate={{
                opacity: 0.1,
                background: [
                  "linear-gradient(90deg, #93b44a 0%, #BFF549 100%)",
                  "linear-gradient(90deg, #BFF549 0%, #93b44a 100%)",
                  "linear-gradient(90deg, #93b44a 0%, #BFF549 100%)",
                ],
              }}
              transition={{ duration: 15, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            />
          )}
          <div
            className="absolute inset-0 overflow-hidden rounded-full -z-5"
            style={{ filter: isUnsupportedBrowser ? "none" : `url(#${filterId})` }}
          >
            {particles}
          </div>
          {isClicked && (
            <>
              <motion.div
                className="absolute inset-0 -z-5 rounded-full bg-[#93b44a]/10"
                initial={{ scale: 0, opacity: 0.7 }}
                animate={{ scale: 2, opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
              <motion.div
                className="absolute inset-0 -z-5 rounded-full bg-white/10"
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            </>
          )}
          {clickParticles}
          <motion.div className="pl-4 py-3" variants={searchIconVariants} initial="initial" animate="animate">
            <Search
              size={20}
              strokeWidth={isFocused ? 2.5 : 2}
              className={cn(
                "transition-all duration-300",
                isAnimating ? "text-[#BFF549]" : isFocused ? "text-[#BFF549]" : "text-[#99A1AF]",
              )}
            />
          </motion.div>
          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={handleSearch}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current)
              blurTimeoutRef.current = setTimeout(() => setIsFocused(false), 200)
            }}
            className={cn(
              "w-full py-3 bg-transparent outline-none placeholder:text-[#99A1AF]/60 font-medium text-base relative z-10",
              isFocused ? "text-white tracking-wide" : "text-[#99A1AF]"
            )}
          />
          <AnimatePresence>
            {searchQuery && (
              <motion.button
                type="button"
                onClick={() => {
                  setSearchQuery("")
                  onSearch?.("")
                  setSuggestions([])
                }}
                initial={{ opacity: 0, scale: 0.8, x: -20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: -20 }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 10px 25px -5px rgba(147, 180, 74, 0.5)",
                }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 mr-2 text-xs font-medium rounded-full bg-[#93b44a] text-black backdrop-blur-sm transition-all shadow-lg uppercase tracking-wider"
              >
                Clear
              </motion.button>
            )}
          </AnimatePresence>
          {isFocused && (
            <motion.div
              className="absolute inset-0 rounded-full"
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0, 0.1, 0.2, 0.1, 0],
                background: "radial-gradient(circle at 50% 0%, rgba(191,245,73,0.3) 0%, transparent 70%)",
              }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatType: "loop" }}
            />
          )}
        </motion.div>
      </motion.form>
      <AnimatePresence>
        {isFocused && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: 10, height: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute z-10 w-full mt-2 overflow-hidden bg-black/90 backdrop-blur-md rounded-lg shadow-xl border border-[#93b44a]/20"
            style={{
              maxHeight: "300px",
              overflowY: "auto",
              filter: isUnsupportedBrowser ? "none" : "drop-shadow(0 15px 15px rgba(0,0,0,0.3))",
            }}
          >
            <div className="p-2">
              {suggestions.map((suggestion, index) => (
                <motion.div
                  key={suggestion}
                  custom={index}
                  variants={suggestionVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  onClick={() => {
                    setSearchQuery(suggestion)
                    onSearch?.(suggestion)
                    setIsFocused(false)
                  }}
                  className="flex items-center gap-2 px-4 py-2 cursor-pointer rounded-md hover:bg-[#93b44a]/10 group"
                >
                  <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ delay: index * 0.06 }}>
                    <CircleDot size={16} className="text-[#93b44a] group-hover:text-[#BFF549]" />
                  </motion.div>
                  <motion.span
                    className="text-[#99A1AF] group-hover:text-white"
                    initial={{ x: -5, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.08 }}
                  >
                    {suggestion}
                  </motion.span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export { SearchBar }
