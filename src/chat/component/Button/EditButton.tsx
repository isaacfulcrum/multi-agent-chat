import { EditIcon } from "@chakra-ui/icons";
import { IconButton } from "@chakra-ui/react";

type Props = {
  onClick: () => void;
};

// ********************************************************************************
export const EditButton: React.FC<Props> = ({ onClick }) => {
  return (
    <IconButton
      size="xs"
      fontSize="14px"
      onClick={onClick}
      variant="outline"
      aria-label="Edit"
      icon={<EditIcon />}
      colorScheme="whiteAlpha"
    />
  );
};

export default EditButton;
