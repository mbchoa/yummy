import classNames from "classnames";
import Image from "next/image";

// Yelp's display requirements: ratings use Yelp's own star images, and Yelp's
// logo, linked to Yelp, shows on content that came from Yelp
// https://terms.yelp.com/developers/display_requirements/

const STAR_SIZES = {
  // the images are 2x, 88x16 and 108x20 at 1x
  small: { width: 88, height: 16 },
  medium: { width: 108, height: 20 },
};

interface IYelpStarsProps {
  rating: number;
  size?: keyof typeof STAR_SIZES;
}

export const YelpStars = ({ rating, size = "medium" }: IYelpStarsProps) => {
  // Yelp has an image for each half star
  const roundedRating = Math.min(5, Math.max(0, Math.round(rating * 2) / 2));
  return (
    <Image
      src={`/yelp/stars/${size}/${roundedRating}.png`}
      alt={`${rating} star rating`}
      {...STAR_SIZES[size]}
      // fixed size, so flex layouts and Tailwind's img reset can't stretch it
      style={STAR_SIZES[size]}
      className="shrink-0"
    />
  );
};

interface IYelpLogoProps {
  // yelp.com or the business's Yelp page
  href: string;
  className?: string;
}

export const YelpLogo = ({ href, className }: IYelpLogoProps) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className={classNames("inline-flex shrink-0", className)}
  >
    {/* the logo is 1000x385 */}
    <Image src="/yelp/logo.svg" alt="View on Yelp" width={52} height={20} />
  </a>
);
