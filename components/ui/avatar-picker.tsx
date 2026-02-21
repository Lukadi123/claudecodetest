"use client";
import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X } from "lucide-react";

interface Avatar {
    id: number;
    svg: React.ReactNode;
    alt: string;
}

const avatars: Avatar[] = [
    {
        id: 1,
        svg: (
            <svg
                viewBox="0 0 36 36"
                fill="none"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
                aria-label="Avatar 1"
            >
                <mask
                    id=":r111:"
                    maskUnits="userSpaceOnUse"
                    x="0"
                    y="0"
                    width="36"
                    height="36"
                >
                    <rect width="36" height="36" rx="72" fill="#FFFFFF" />
                </mask>
                <g mask="url(#:r111:)">
                    <rect width="36" height="36" fill="#ff005b" />
                    <rect
                        x="0"
                        y="0"
                        width="36"
                        height="36"
                        transform="translate(9 -5) rotate(219 18 18) scale(1)"
                        fill="#ffb238"
                        rx="6"
                    />
                    <g transform="translate(4.5 -4) rotate(9 18 18)">
                        <path
                            d="M15 19c2 1 4 1 6 0"
                            stroke="#000000"
                            fill="none"
                            strokeLinecap="round"
                        />
                        <rect
                            x="10"
                            y="14"
                            width="1.5"
                            height="2"
                            rx="1"
                            stroke="none"
                            fill="#000000"
                        />
                        <rect
                            x="24"
                            y="14"
                            width="1.5"
                            height="2"
                            rx="1"
                            stroke="none"
                            fill="#000000"
                        />
                    </g>
                </g>
            </svg>
        ),
        alt: "Avatar 1",
    },
    {
        id: 2,
        svg: (
            <svg
                viewBox="0 0 36 36"
                fill="none"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
            >
                <mask
                    id=":R4mrttb:"
                    maskUnits="userSpaceOnUse"
                    x="0"
                    y="0"
                    width="36"
                    height="36"
                >
                    <rect width="36" height="36" rx="72" fill="#FFFFFF"></rect>
                </mask>
                <g mask="url(#:R4mrttb:)">
                    <rect width="36" height="36" fill="#ff7d10"></rect>
                    <rect
                        x="0"
                        y="0"
                        width="36"
                        height="36"
                        transform="translate(5 -1) rotate(55 18 18) scale(1.1)"
                        fill="#0a0310"
                        rx="6"
                    />
                    <g transform="translate(7 -6) rotate(-5 18 18)">
                        <path
                            d="M15 20c2 1 4 1 6 0"
                            stroke="#FFFFFF"
                            fill="none"
                            strokeLinecap="round"
                        />
                        <rect
                            x="14"
                            y="14"
                            width="1.5"
                            height="2"
                            rx="1"
                            stroke="none"
                            fill="#FFFFFF"
                        />
                        <rect
                            x="20"
                            y="14"
                            width="1.5"
                            height="2"
                            rx="1"
                            stroke="none"
                            fill="#FFFFFF"
                        />
                    </g>
                </g>
            </svg>
        ),
        alt: "Avatar 2",
    },
    {
        id: 3,
        svg: (
            <svg
                viewBox="0 0 36 36"
                fill="none"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
            >
                <mask
                    id=":r11c:"
                    maskUnits="userSpaceOnUse"
                    x="0"
                    y="0"
                    width="36"
                    height="36"
                >
                    <rect width="36" height="36" rx="72" fill="#FFFFFF"></rect>
                </mask>
                <g mask="url(#:r11c:)">
                    <rect width="36" height="36" fill="#0a0310" />
                    <rect
                        x="0"
                        y="0"
                        width="36"
                        height="36"
                        transform="translate(-3 7) rotate(227 18 18) scale(1.2)"
                        fill="#ff005b"
                        rx="36"
                    />
                    <g transform="translate(-3 3.5) rotate(7 18 18)">
                        <path d="M13,21 a1,0.75 0 0,0 10,0" fill="#FFFFFF" />
                        <rect
                            x="12"
                            y="14"
                            width="1.5"
                            height="2"
                            rx="1"
                            stroke="none"
                            fill="#FFFFFF"
                        />
                        <rect
                            x="22"
                            y="14"
                            width="1.5"
                            height="2"
                            rx="1"
                            stroke="none"
                            fill="#FFFFFF"
                        />
                    </g>
                </g>
            </svg>
        ),
        alt: "Avatar 3",
    },
    {
        id: 4,
        svg: (
            <svg
                viewBox="0 0 36 36"
                fill="none"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
            >
                <mask
                    id=":r1gg:"
                    maskUnits="userSpaceOnUse"
                    x="0"
                    y="0"
                    width="36"
                    height="36"
                >
                    <rect width="36" height="36" rx="72" fill="#FFFFFF"></rect>
                </mask>
                <g mask="url(#:r1gg:)">
                    <rect width="36" height="36" fill="#d8fcb3"></rect>
                    <rect
                        x="0"
                        y="0"
                        width="36"
                        height="36"
                        transform="translate(9 -5) rotate(219 18 18) scale(1)"
                        fill="#89fcb3"
                        rx="6"
                    ></rect>
                    <g transform="translate(4.5 -4) rotate(9 18 18)">
                        <path
                            d="M15 19c2 1 4 1 6 0"
                            stroke="#000000"
                            fill="none"
                            strokeLinecap="round"
                        ></path>
                        <rect
                            x="10"
                            y="14"
                            width="1.5"
                            height="2"
                            rx="1"
                            stroke="none"
                            fill="#000000"
                        ></rect>
                        <rect
                            x="24"
                            y="14"
                            width="1.5"
                            height="2"
                            rx="1"
                            stroke="none"
                            fill="#000000"
                        ></rect>
                    </g>
                </g>
            </svg>
        ),
        alt: "Avatar 4",
    },
];

// Export avatars so other components can look up by ID
export { avatars };
export type { Avatar };

const mainAvatarVariants = {
    initial: {
        y: 20,
        opacity: 0,
    },
    animate: {
        y: 0,
        opacity: 1,
        transition: {
            type: "spring" as const,
            stiffness: 200,
            damping: 20,
        },
    },
    exit: {
        y: -20,
        opacity: 0,
        transition: {
            duration: 0.2,
        },
    },
};

const pickerVariants = {
    container: {
        initial: { opacity: 0 },
        animate: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    },
    item: {
        initial: {
            y: 20,
            opacity: 0,
        },
        animate: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring" as const,
                stiffness: 300,
                damping: 20,
            },
        },
    },
};

const selectedVariants = {
    initial: {
        opacity: 0,
        rotate: -180,
    },
    animate: {
        opacity: 1,
        rotate: 0,
        transition: {
            type: "spring" as const,
            stiffness: 200,
            damping: 15,
        },
    },
    exit: {
        opacity: 0,
        rotate: 180,
        transition: {
            duration: 0.2,
        },
    },
};

export type AvatarSelection = {
    type: 'preset';
    avatarId: number;
} | {
    type: 'custom';
    imageUrl: string;
    file: File;
};

interface AvatarPickerProps {
    userName?: string;
    onSelect?: (selection: AvatarSelection) => void;
}

export function AvatarPicker({ userName = "Me", onSelect }: AvatarPickerProps) {
    const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(null);
    const [customImage, setCustomImage] = useState<string | null>(null);
    const [rotationCount, setRotationCount] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Cleanup object URL on unmount to prevent memory leaks
    useEffect(() => {
        return () => {
            if (customImage) URL.revokeObjectURL(customImage);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleAvatarSelect = (avatar: Avatar) => {
        // Revoke old custom image URL before clearing it
        if (customImage) URL.revokeObjectURL(customImage);
        setCustomImage(null);
        setRotationCount((prev) => prev + 1080);
        setSelectedAvatar(avatar);
        onSelect?.({ type: 'preset', avatarId: avatar.id });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) return;
        if (file.size > 5 * 1024 * 1024) return;

        // Revoke old custom image URL before creating a new one
        if (customImage) URL.revokeObjectURL(customImage);
        const url = URL.createObjectURL(file);
        setCustomImage(url);
        setSelectedAvatar(null);
        setRotationCount((prev) => prev + 1080);
        onSelect?.({ type: 'custom', imageUrl: url, file });
    };

    const clearCustomImage = () => {
        if (customImage) URL.revokeObjectURL(customImage);
        setCustomImage(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const hasSelection = selectedAvatar !== null || customImage !== null;

    return (
        <motion.div initial="initial" animate="animate" className="w-full">
            <Card className="w-full max-w-md mx-auto overflow-hidden border-[rgba(147,180,74,0.2)] bg-gradient-to-b from-black to-[rgba(147,180,74,0.05)]">
                <CardContent className="p-0">
                    {/* Background header */}
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{
                            opacity: 1,
                            height: "8rem",
                            transition: {
                                height: {
                                    type: "spring",
                                    stiffness: 100,
                                    damping: 20,
                                },
                            },
                        }}
                        className="bg-gradient-to-r from-[#93b44a]/20 to-[#93b44a]/10 w-full"
                    />

                    <div className="px-8 pb-8 -mt-16">
                        {/* Main avatar display */}
                        <motion.div
                            className="relative w-40 h-40 mx-auto rounded-full overflow-hidden border-4 border-[#93b44a]/40 bg-black flex items-center justify-center"
                            variants={mainAvatarVariants}
                            layoutId="selectedAvatar"
                        >
                            {customImage ? (
                                <motion.img
                                    src={customImage}
                                    alt="Custom avatar"
                                    className="w-full h-full object-cover"
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                />
                            ) : selectedAvatar ? (
                                <motion.div
                                    className="w-full h-full flex items-center justify-center scale-[3]"
                                    animate={{
                                        rotate: rotationCount,
                                    }}
                                    transition={{
                                        duration: 0.8,
                                        ease: [0.4, 0, 0.2, 1],
                                    }}
                                >
                                    {selectedAvatar.svg}
                                </motion.div>
                            ) : (
                                <motion.div
                                    className="text-[#99A1AF] text-sm text-center px-4"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    Pick an avatar
                                </motion.div>
                            )}
                        </motion.div>

                        {/* Username display */}
                        <motion.div
                            className="text-center mt-4"
                            variants={pickerVariants.item}
                        >
                            <motion.h2
                                className="text-2xl font-bold text-white"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                {userName}
                            </motion.h2>
                            <motion.p
                                className="text-[#99A1AF] text-sm"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                            >
                                {hasSelection ? 'Looking good!' : 'Select your avatar'}
                            </motion.p>
                        </motion.div>

                        {/* Avatar selection */}
                        <motion.div
                            className="mt-6"
                            variants={pickerVariants.container}
                        >
                            <motion.div
                                className="flex justify-center gap-4 items-center"
                                variants={pickerVariants.container}
                            >
                                {avatars.map((avatar) => (
                                    <motion.button
                                        key={avatar.id}
                                        onClick={() =>
                                            handleAvatarSelect(avatar)
                                        }
                                        className={cn(
                                            "relative w-12 h-12 rounded-full overflow-hidden border-2 cursor-pointer",
                                            "transition-all duration-300"
                                        )}
                                        variants={pickerVariants.item}
                                        whileHover={{
                                            y: -2,
                                            transition: { duration: 0.2 },
                                        }}
                                        whileTap={{
                                            y: 0,
                                            transition: { duration: 0.2 },
                                        }}
                                        aria-label={`Select ${avatar.alt}`}
                                        aria-pressed={
                                            selectedAvatar?.id === avatar.id
                                        }
                                    >
                                        <div className="w-full h-full flex items-center justify-center">
                                            {avatar.svg}
                                        </div>
                                        {selectedAvatar?.id === avatar.id && (
                                            <motion.div
                                                className="absolute inset-0 bg-[#93b44a]/20 ring-2 ring-[#BFF549] ring-offset-2 ring-offset-black rounded-full"
                                                variants={selectedVariants}
                                                initial="initial"
                                                animate="animate"
                                                exit="exit"
                                                layoutId="selectedIndicator"
                                            />
                                        )}
                                    </motion.button>
                                ))}

                                {/* Upload button */}
                                <motion.div
                                    className="relative"
                                    variants={pickerVariants.item}
                                >
                                    {customImage ? (
                                        <div className="relative">
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                className="w-12 h-12 rounded-full overflow-hidden border-2 cursor-pointer ring-2 ring-[#BFF549] ring-offset-2 ring-offset-black"
                                            >
                                                <img
                                                    src={customImage}
                                                    alt="Custom"
                                                    className="w-full h-full object-cover"
                                                />
                                            </button>
                                            <button
                                                onClick={clearCustomImage}
                                                className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-red-400 transition-colors"
                                            >
                                                <X className="w-2.5 h-2.5 text-white" />
                                            </button>
                                        </div>
                                    ) : (
                                        <motion.button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="w-12 h-12 rounded-full border-2 border-dashed border-[#93b44a]/40 flex items-center justify-center cursor-pointer hover:border-[#BFF549] hover:bg-white/5 transition-all duration-300"
                                            whileHover={{
                                                y: -2,
                                                transition: { duration: 0.2 },
                                            }}
                                            whileTap={{
                                                y: 0,
                                                transition: { duration: 0.2 },
                                            }}
                                        >
                                            <Upload className="w-4 h-4 text-[#99A1AF]" />
                                        </motion.button>
                                    )}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                </motion.div>
                            </motion.div>
                        </motion.div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
