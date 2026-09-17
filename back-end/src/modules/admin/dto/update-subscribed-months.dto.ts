import { IsMongoId } from "class-validator";

export class UpdateSubscribedMonthsDto {
  @IsMongoId({
    message: "معرف الشهر غير صالح",
  })
  monthId: string;
}
